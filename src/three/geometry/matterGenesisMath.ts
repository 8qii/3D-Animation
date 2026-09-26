/**
 * Mathematical Foundation for Matter Genesis:
 * Icosahedral geometry defined by 3 orthogonal Golden Ratio (Phi) Cartesian rectangles:
 * XY Plane, YZ Plane, and XZ Plane.
 * This directly preserves the Act II Coordinate DNA (X/Y/Z blueprint axes)
 * as the origin of all matter.
 */

export const PHI = (1 + Math.sqrt(5)) / 2; // Golden Ratio ~ 1.61803398875

// Normalize radius to 1.0, then scale by world-space crystal radius
const INV_NORM = 1.0 / Math.sqrt(1 + PHI * PHI);

/**
 * 12 Normalized Golden Ratio Vertices on unit sphere:
 * Group 1 (XY Plane): (+-1, +-phi, 0)
 * Group 2 (YZ Plane): (0, +-1, +-phi)
 * Group 3 (ZX Plane): (+-phi, 0, +-1)
 */
export const RAW_ICOSAHEDRON_VERTICES: [number, number, number][] = [
  // XY Plane Rectangle
  [-1 * INV_NORM,  PHI * INV_NORM,  0],
  [ 1 * INV_NORM,  PHI * INV_NORM,  0],
  [-1 * INV_NORM, -PHI * INV_NORM,  0],
  [ 1 * INV_NORM, -PHI * INV_NORM,  0],

  // YZ Plane Rectangle
  [0, -1 * INV_NORM,  PHI * INV_NORM],
  [0,  1 * INV_NORM,  PHI * INV_NORM],
  [0, -1 * INV_NORM, -PHI * INV_NORM],
  [0,  1 * INV_NORM, -PHI * INV_NORM],

  // ZX Plane Rectangle
  [ PHI * INV_NORM, 0, -1 * INV_NORM],
  [ PHI * INV_NORM, 0,  1 * INV_NORM],
  [-PHI * INV_NORM, 0, -1 * INV_NORM],
  [-PHI * INV_NORM, 0,  1 * INV_NORM],
];

/**
 * 30 Edges of the Icosahedron connecting the 12 vertices
 */
export const ICOSAHEDRON_EDGES: [number, number][] = [
  // Vertices connecting to 0
  [0, 11], [0, 5], [0, 1], [0, 7], [0, 10],
  // Vertices connecting to 1
  [1, 5], [1, 9], [1, 8], [1, 7],
  // Vertices connecting to 2
  [2, 10], [2, 11], [2, 4], [2, 3], [2, 6],
  // Vertices connecting to 3
  [3, 4], [3, 9], [3, 8], [3, 6],
  // Vertices connecting to 4
  [4, 11], [4, 5], [4, 9],
  // Vertices connecting to 5
  [5, 11], [5, 9],
  // Vertices connecting to 6
  [6, 10], [6, 7], [6, 8],
  // Vertices connecting to 7
  [7, 10], [7, 8],
  // Vertices connecting to 8
  [8, 9],
  // Vertices connecting to 10
  [10, 11],
];

/**
 * 20 Triangular Faces of the Icosahedron
 */
export const ICOSAHEDRON_FACES: [number, number, number][] = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
];

/**
 * Generates vertex buffers for the 12 Golden Ratio nodes
 */
export function generateMatterNodes(radius = 1.45) {
  const count = RAW_ICOSAHEDRON_VERTICES.length;
  const positions = new Float32Array(count * 3);
  const targetPositions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const v = RAW_ICOSAHEDRON_VERTICES[i];
    positions[i * 3]     = 0;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;

    targetPositions[i * 3]     = v[0] * radius;
    targetPositions[i * 3 + 1] = v[1] * radius;
    targetPositions[i * 3 + 2] = v[2] * radius;
  }

  return { count, positions, targetPositions };
}

/**
 * Generates edge line segments with progress attributes [0..1]
 */
export function generateMatterWireframe(radius = 1.45) {
  const edgeCount = ICOSAHEDRON_EDGES.length; // 30 edges * 2 vertices = 60 vertices
  const totalVerts = edgeCount * 2;

  const positions = new Float32Array(totalVerts * 3);
  const targets = new Float32Array(totalVerts * 3);
  const edgeProgress = new Float32Array(totalVerts); // 0 at start vertex, 1 at end vertex
  const edgeIndices = new Float32Array(totalVerts);

  for (let i = 0; i < edgeCount; i++) {
    const [idxA, idxB] = ICOSAHEDRON_EDGES[i];
    const vA = RAW_ICOSAHEDRON_VERTICES[idxA];
    const vB = RAW_ICOSAHEDRON_VERTICES[idxB];

    const v1 = i * 2;
    const v2 = i * 2 + 1;

    // Start vertex
    positions[v1 * 3]     = 0;
    positions[v1 * 3 + 1] = 0;
    positions[v1 * 3 + 2] = 0;

    targets[v1 * 3]     = vA[0] * radius;
    targets[v1 * 3 + 1] = vA[1] * radius;
    targets[v1 * 3 + 2] = vA[2] * radius;

    edgeProgress[v1] = 0.0;
    edgeIndices[v1] = i;

    // End vertex
    positions[v2 * 3]     = 0;
    positions[v2 * 3 + 1] = 0;
    positions[v2 * 3 + 2] = 0;

    targets[v2 * 3]     = vB[0] * radius;
    targets[v2 * 3 + 1] = vB[1] * radius;
    targets[v2 * 3 + 2] = vB[2] * radius;

    edgeProgress[v2] = 1.0;
    edgeIndices[v2] = i;
  }

  return { totalVerts, positions, targets, edgeProgress, edgeIndices };
}

/**
 * Generates triangular facet geometry with barycentric coordinates and face normals
 */
export function generateMatterFacets(radius = 1.45) {
  const faceCount = ICOSAHEDRON_FACES.length; // 20 faces * 3 vertices = 60 vertices
  const totalVerts = faceCount * 3;

  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  const barycentric = new Float32Array(totalVerts * 3);

  for (let i = 0; i < faceCount; i++) {
    const [idxA, idxB, idxC] = ICOSAHEDRON_FACES[i];
    const vA = RAW_ICOSAHEDRON_VERTICES[idxA];
    const vB = RAW_ICOSAHEDRON_VERTICES[idxB];
    const vC = RAW_ICOSAHEDRON_VERTICES[idxC];

    const ax = vA[0] * radius, ay = vA[1] * radius, az = vA[2] * radius;
    const bx = vB[0] * radius, by = vB[1] * radius, bz = vB[2] * radius;
    const cx = vC[0] * radius, cy = vC[1] * radius, cz = vC[2] * radius;

    // Calculate face normal
    const abx = bx - ax, aby = by - ay, abz = bz - az;
    const acx = cx - ax, acy = cy - ay, acz = cz - az;
    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;
    const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;
    const fnx = nx / nLen, fny = ny / nLen, fnz = nz / nLen;

    const base = i * 3;

    // Vertex A
    positions[base * 3]     = ax;
    positions[base * 3 + 1] = ay;
    positions[base * 3 + 2] = az;
    normals[base * 3]       = fnx;
    normals[base * 3 + 1]   = fny;
    normals[base * 3 + 2]   = fnz;
    barycentric[base * 3]     = 1;
    barycentric[base * 3 + 1] = 0;
    barycentric[base * 3 + 2] = 0;

    // Vertex B
    positions[(base + 1) * 3]     = bx;
    positions[(base + 1) * 3 + 1] = by;
    positions[(base + 1) * 3 + 2] = bz;
    normals[(base + 1) * 3]       = fnx;
    normals[(base + 1) * 3 + 1]   = fny;
    normals[(base + 1) * 3 + 2]   = fnz;
    barycentric[(base + 1) * 3]     = 0;
    barycentric[(base + 1) * 3 + 1] = 1;
    barycentric[(base + 1) * 3 + 2] = 0;

    // Vertex C
    positions[(base + 2) * 3]     = cx;
    positions[(base + 2) * 3 + 1] = cy;
    positions[(base + 2) * 3 + 2] = cz;
    normals[(base + 2) * 3]       = fnx;
    normals[(base + 2) * 3 + 1]   = fny;
    normals[(base + 2) * 3 + 2]   = fnz;
    barycentric[(base + 2) * 3]     = 0;
    barycentric[(base + 2) * 3 + 1] = 0;
    barycentric[(base + 2) * 3 + 2] = 1;
  }

  return { totalVerts, positions, normals, barycentric };
}
