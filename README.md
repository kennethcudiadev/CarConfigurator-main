# Watch Configurator

A 3D watch configurator built with **React Three Fiber**, **Drei**, and **GSAP**. Customize band, case, and dial colors with a live 3D preview.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Watch model**  
   The watch FBX is expected at `public/models/watch.fbx`.  
   If you need to replace it, copy your `.fbx` file to:
   ```
   public/models/watch.fbx
   ```

3. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173).

## Customization

- **Band / Case / Dial** – Use the right panel to pick colors. The app matches mesh names containing `band`, `strap`, `bracelet`, `case`, `bezel`, `body`, `dial`, `face`, or `crystal`. If your FBX uses different names, edit `src/components/Watch.jsx` and adjust the `colorizeByNames` logic.

- **Rotate** – Use the slider or orbit the view with the mouse.

## Stack

- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) – React renderer for Three.js  
- [Drei](https://github.com/pmndrs/drei) – R3F helpers (e.g. `useFBX`, `OrbitControls`, `Environment`)  
- [GSAP](https://greensock.com/gsap/) – UI animations  
- [Vite](https://vitejs.dev/) – Build tool
