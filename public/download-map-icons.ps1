# Download Leaflet marker icons
$baseUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/"
$icons = @(
    "marker-icon-2x.png",
    "marker-icon.png",
    "marker-shadow.png"
)

foreach ($icon in $icons) {
    $url = "$baseUrl$icon"
    $output = ".\public\$icon"
    Write-Host "Downloading $url to $output"
    Invoke-WebRequest -Uri $url -OutFile $output
}

Write-Host "Map icons downloaded successfully!"
