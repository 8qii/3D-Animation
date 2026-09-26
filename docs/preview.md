# SHOWCASE RECORDING & PREVIEW GUIDE
### Developer Preview Mode & High-Fidelity Video Capture Workflow

---

## 1. PREVIEW MODE OVERVIEW

The application includes an automated cinematic preview engine designed for capturing award-winning portfolio video reels, social showcases, and client presentations.

### Key Capabilities
- **Keyboard Shortcut `P`**: Instantly triggers or cancels the automated **30-second choreographed camera sequence**.
- **FPS Counter**:
  - Automatically visible in local development (`npm run dev`) and when `?debug=true` is enabled.
  - Automatically **hidden in production** to preserve pristine aesthetic immersion.
- **Developer Debug Panel**:
  - Accessible strictly via URL query parameter: `http://localhost:3000?debug=true`.
  - Provides real-time sliders for Bloom intensity, Depth of Field toggle, particle Brownian speed multiplier, and camera status.

---

## 2. HOW TO ACCESS PREVIEW & DEBUG MODES

### Standard Cinematic Preview
1. Run the local application:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000).
3. Press **`P`** on your keyboard.
   - The automated 30-second flight path engages immediately.
   - A minimalist telemetry banner appears: `CINEMATIC PREVIEW • 00:00 / 30.0s • PRESS P TO EXIT`.
   - The camera begins its four-phase choreography around the quantum light fluctuation.
4. Press **`P`** again at any time to return to the interactive, breathing observer state.

### Debug Mode Console (`?debug=true`)
1. Open the URL with the debug flag:
   ```
   http://localhost:3000?debug=true
   ```
2. A glassmorphic console appears in the bottom-right corner with:
   - Live FPS & Frame time telemetry.
   - Real-time **Bloom Intensity** slider ($0.0 \to 3.0$).
   - Real-time **Particle Speed** slider ($0.1\times \to 3.0\times$).
   - **Depth of Field** toggle.
   - One-click **30s Flight Trigger**.

---

## 3. 30-SECOND FLIGHT CHOREOGRAPHY BREAKDOWN

The automated flight path is divided into four seamless cinematic acts:

| Phase | Timecode | Camera Movement | Cinematographic Intent |
| :--- | :--- | :--- | :--- |
| **Phase 1** | `00:00` – `00:07` | Slow forward tracking $[0.0, 0.2, 7.5] \to [0.0, -0.2, 4.8]$ | The Approaching Gaze: Establishing intimacy with the void. |
| **Phase 2** | `00:07` – `00:16` | Dynamic sweeping vitrine arc ($180^\circ$ orbit) | Revealing volumetric depth and dust particle parallax. |
| **Phase 3** | `00:16` – `00:23` | Ascending crane shot with downward tilt $[0.4, 3.2, 3.4]$ | Gazing down into the singularity through foreground bokeh. |
| **Phase 4** | `00:23` – `00:30` | Longitudinal pull-back returning to origin $[0.0, 0.0, 7.0]$ | Re-centering the observer into contemplative stillness. |

---

## 4. SHOWCASE VIDEO RECORDING SPECIFICATIONS

### Recommended Capture Software
- **OBS Studio** (v30.0+) or **Blackmagic ATEM Mini Pro** / **GeForce Experience ShadowPlay**.

### Recommended OBS Studio Settings

#### Video Canvas & Resolution
- **Base (Canvas) Resolution**: `3840x2160` (4K UHD) or `2560x1440` (2K QHD).
- **Output (Scaled) Resolution**: `3840x2160` (no downscaling filter).
- **Common FPS Values**: `60 FPS` (or `120 FPS` for ultra-smooth optical flow slow-motion).

#### Recording Quality & Encoder
- **Output Mode**: Advanced $\to$ Recording.
- **Recording Format**: `.mp4` or `.mov` (Fragmented MP4 for crash safety).
- **Video Encoder**:
  - *macOS*: `Apple ProRes 422 HQ` or `Apple HEVC (Hardware)`.
  - *Windows / Linux*: `NVIDIA NVENC AV1` or `NVENC HEVC`.
- **Rate Control**: `CQP` (Constant Quantization Parameter).
- **CQ Level**: `14` (visually lossless) to `16`.
- **Keyframe Interval**: `2 seconds`.
- **Color Format**: `NV12` or `P010` (10-bit).
- **Color Space**: `Rec. 709` (or `Rec. 2100 PQ` if recording in HDR).
- **Color Range**: `Full` ($0\text{–}255$ to prevent crushed void blacks).

---

## 5. STEP-BY-STEP RECORDING WORKFLOW

### Step 1: Maximize Browser Viewport
1. Open the experience in Google Chrome, Brave, or Safari:
   ```
   http://localhost:3000
   ```
   *(Do NOT include `?debug=true` for clean showcase reels unless you want HUD telemetry).*
2. Press **`F11`** (Windows/Linux) or **`Cmd + Shift + F`** (macOS) to enter borderless fullscreen mode.
3. Hide the mouse cursor by parking it off the screen edge or using a cursor-hiding utility.

### Step 2: Synchronize Recording
1. In OBS Studio, use **Window Capture** or **Display Capture** targeting the browser canvas.
2. Hit **Start Recording** in OBS.
3. Allow 2 seconds of stationary void breathing.
4. Press **`P`** to initiate the 30-second camera sequence.
5. The sequence will run through all four phases with zero jerky mouse interference.
6. Once the camera completes its 30-second loop and settles back into origin, let it breathe for 2 more seconds.
7. Hit **Stop Recording** in OBS.

---

## 6. POST-PRODUCTION & EDITING TIPS

1. **Aspect Ratio Options**:
   - **Cinemascope (2.39:1)**: Crop to `3840x1606` for a wide theatrical feature-film appearance.
   - **Social Reel (9:16)**: Crop the central $1080\times 1920$ vertical column targeting the quantum fluctuation for TikTok, Instagram Reels, and YouTube Shorts.
2. **Color Grading**:
   - Apply a subtle filmic S-curve in DaVinci Resolve or Premiere Pro.
   - Lift deep shadows slightly to reveal the dithered indigo cathedral atmosphere.
   - Add $0.5\%$ 35mm fine grain (e.g. Kodak 5207 emulation) to merge digital pixels with cinematic celluloid texture.
3. **Audio Sync**:
   - Layer a 38 Hz pure sine sub-bass drone and subtle crystal hydrophone clicks timed with camera arc peaks (at $00:07$ and $00:16$).
