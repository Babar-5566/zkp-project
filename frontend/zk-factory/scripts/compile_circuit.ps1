$ErrorActionPreference = "Stop"

$circomPath = ".\circom.exe"
if (-Not (Test-Path $circomPath)) {
    Write-Host "Downloading circom..."
    Invoke-WebRequest -Uri "https://github.com/iden3/circom/releases/latest/download/circom-windows-amd64.exe" -OutFile $circomPath
}

Write-Host "Compiling circuit..."
if (-Not (Test-Path "build")) {
    mkdir "build" | Out-Null
}
& $circomPath circuits\age_check.circom --r1cs --wasm --sym -o build

Write-Host "Generating Powers of Tau locally..."
$ptauPath = "build\pot12_final.ptau"
if (-Not (Test-Path $ptauPath)) {
    echo "entropy1" | npx snarkjs powersoftau new bn128 12 build\pot12_0000.ptau -v
    echo "entropy2" | npx snarkjs powersoftau contribute build\pot12_0000.ptau build\pot12_0001.ptau --name="First contribution" -v
    npx snarkjs powersoftau prepare phase2 build\pot12_0001.ptau $ptauPath -v
}

Write-Host "Generating groth16 setup..."
npx snarkjs groth16 setup build\age_check.r1cs $ptauPath build\age_check_0000.zkey
Write-Host "Contributing to phase 2..."
echo "entropy3" | npx snarkjs zkey contribute build\age_check_0000.zkey build\age_check_final.zkey --name="1st Contributor Name" -v 
Write-Host "Exporting verification key..."
npx snarkjs zkey export verificationkey build\age_check_final.zkey build\verification_key.json

Write-Host "Exporting vkey to vk_01.json..."
Copy-Item build\verification_key.json build\vk_01.json

Write-Host "Done."
