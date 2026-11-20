/* Modelo CAD 3D del aeropéndulo invertido para el visor del simulador.
   Generado por tools/preparar_cad.py a partir de ../videos/render/aeropendulo.glb (mm, Y hacia arriba).
   Frente del equipo = lado −Z. Pivote = eje del encoder dentro del acople, paralelo a Z.
   θ > 0 inclina la varilla hacia +X (rotación −θ alrededor de +Z). */
window.CAD_INDEX = {
  "glb": "assets/cad/aeropendulo.glb",
  "units": "mm",
  "pivot": [-179.82, 140.28, 1090.26],
  "axis": [0, 0, 1],
  "sign": -1,
  "moving": "propeller|Acople|Soporte_Motores|Motor_Para|Varilla",
  "prop": "propeller",
  "motor": "Motor_Para"
};
