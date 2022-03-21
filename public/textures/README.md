# PBR Textures

Place your PBR texture maps here for the configurator. Required filenames:

| File | Usage |
|------|--------|
| `albedo.jpg` | Base color (diffuse) |
| `roughness.jpg` | Surface roughness (grayscale: black = smooth, white = rough) |
| `metalness.jpg` | Metallic areas (grayscale: black = dielectric, white = metal) |
| `normal.jpg` | Surface detail (tangent-space normal map) |
| `ao.jpg` | Ambient occlusion (grayscale, crevice shadows) |

Use `.png` if you prefer — update paths in `src/config/textures.js` to match.
