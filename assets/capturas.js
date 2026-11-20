/* Medios del sitio: renders con los colores de SolidWorks, vistas rotuladas y videos explicativos.
   Numeración de piezas: 1 Mástil · 2 Base con canal de cableado y tapas · 3 Varilla (250 mm) ·
   4 Acople varilla–encoder · 5 Encoder óptico YUMO E6B2-CWZ3E · 6 Soporte de motores · 7 Motor DC (×2) ·
   8 Hélice (×2) · 9 Caja electrónica · 10 DAQ NI USB-6212 · 11 Generador de onda. */
window.CAD_FOTOS = [
  { src: "assets/render/foto_isometrica.jpg", label: "Ensamblaje completo" },
  { src: "assets/render/foto_pendulo.jpg", label: "Péndulo" },
  { src: "assets/render/foto_frontal.jpg", label: "Vista frontal" },
  { src: "assets/render/foto_lateral.jpg", label: "Vista lateral" },
];
window.CAD_CAPTURAS = [
  { src: "assets/rotulos/rotulo_isometrica.jpg", label: "Vista isométrica", wide: true },
  { src: "assets/rotulos/rotulo_frontal.jpg", label: "Vista frontal", wide: true },
  { src: "assets/rotulos/rotulo_superior_varilla.jpg", label: "Soporte de motores y varilla", wide: false },
  { src: "assets/rotulos/rotulo_pivote.jpg", label: "Pivote (vista posterior)", wide: false },
];
window.VIDEOS = [
  { file: "assets/videos/planta_funcionando.mp4", label: "La planta funcionando", ok: true, main: true },
  { file: "assets/videos/aeropendulo_video_completo.mp4", label: "Del boceto a la planta", ok: true },
  { file: "assets/videos/explicativo/00_como_funciona_completo.mp4", label: "Cómo funciona: video completo", ok: true },
  { file: "assets/videos/explicativo/01_el_problema.mp4", label: "1 · El problema", ok: true },
  { file: "assets/videos/explicativo/02_encoder.mp4", label: "2 · Encoder", ok: true },
  { file: "assets/videos/explicativo/03_daq_labview.mp4", label: "3 · DAQ + LabVIEW", ok: true },
  { file: "assets/videos/explicativo/04_generador_lm324.mp4", label: "4 · Generador + LM324", ok: true },
  { file: "assets/videos/explicativo/05_puente_h.mp4", label: "5 · Puente H L298N", ok: true },
  { file: "assets/videos/explicativo/06_motor_helice.mp4", label: "6 · Motor + hélice", ok: true },
  { file: "assets/videos/explicativo/07_lazo_cerrado.mp4", label: "7 · Lazo cerrado", ok: true },
];
