$ErrorActionPreference = "Stop"

$circomPath = ".\circom.exe"
if (-Not (Test-Path $circomPath)) {
    Write-Host "Downloading circom..."
    Invoke-WebRequest -Uri "https://github.com/iden3/circom/releases/latest/download/circom-windows-amd64.exe" -OutFile $circomPath
}

if (-Not (Test-Path "build")) {
    mkdir "build" | Out-Null
}

# ============================================
# Powers of Tau (shared across all circuits)
# ============================================
$ptauPath = "build\pot12_final.ptau"
if (-Not (Test-Path $ptauPath)) {
    Write-Host "Generating Powers of Tau locally..."
    echo "entropy1" | npx snarkjs powersoftau new bn128 12 build\pot12_0000.ptau -v
    echo "entropy2" | npx snarkjs powersoftau contribute build\pot12_0000.ptau build\pot12_0001.ptau --name="First contribution" -v
    npx snarkjs powersoftau prepare phase2 build\pot12_0001.ptau $ptauPath -v
}

# ============================================
# Compile and setup each circuit (PLONK)
# ============================================
$circuits = @(
    "age_check",
    "equality_check",
    "range_check",
    "year_check",
    "date_check",
    "hash_check",
    "set_membership",
    "string_match",
    "cross_field"
)

foreach ($circuit in $circuits) {
    Write-Host ""
    Write-Host "=========================================="
    Write-Host "  Compiling circuit: $circuit"
    Write-Host "=========================================="

    # 1. Compile circom -> r1cs + wasm + sym
    Write-Host "Compiling $circuit.circom..."
    & $circomPath circuits\$circuit.circom --r1cs --wasm --sym -o build

    # 2. PLONK setup (universal — no Phase 2 contribution needed)
    Write-Host "Generating PLONK setup for $circuit..."
    npx snarkjs plonk setup build\$circuit.r1cs $ptauPath build\${circuit}.zkey

    # 3. Export verification key
    Write-Host "Exporting verification key for $circuit..."
    npx snarkjs zkey export verificationkey build\${circuit}.zkey build\${circuit}_vkey.json

    Write-Host "Done with $circuit."
}

# Keep backward-compatible vk_01.json for age_check
if (Test-Path "build\age_check_vkey.json") {
    Copy-Item build\age_check_vkey.json build\vk_01.json
}

Write-Host ""
Write-Host "=========================================="
Write-Host "  All circuits compiled successfully!"
Write-Host "=========================================="

# ============================================
# Copy artifacts to frontend/public/zk/
# ============================================
$frontendZkDir = "..\..\frontend\public\zk"
if (-Not (Test-Path $frontendZkDir)) {
    mkdir $frontendZkDir | Out-Null
}

Write-Host "Copying artifacts to frontend/public/zk/..."
foreach ($circuit in $circuits) {
    $wasmSrc = "build\${circuit}_js\${circuit}.wasm"
    $zkeySrc = "build\${circuit}.zkey"

    if (Test-Path $wasmSrc) {
        Copy-Item $wasmSrc "$frontendZkDir\${circuit}.wasm" -Force
        Write-Host "  Copied ${circuit}.wasm"
    } else {
        Write-Host "  WARNING: $wasmSrc not found!" -ForegroundColor Yellow
    }

    if (Test-Path $zkeySrc) {
        Copy-Item $zkeySrc "$frontendZkDir\${circuit}.zkey" -Force
        Write-Host "  Copied ${circuit}.zkey"
    } else {
        Write-Host "  WARNING: $zkeySrc not found!" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "All done. Frontend artifacts are in frontend/public/zk/"
