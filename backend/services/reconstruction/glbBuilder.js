/**
 * ExploreX Binary GLTF/GLB 2.0 Builder
 * Generates specification-compliant .glb binary assets from 3D geometry
 */

function createGLB({
  vertices,
  indices,
  normals,
  uvs,
  name = "ReconstructedMesh",
  baseColor = [0.72, 0.58, 0.44, 1.0], // Warm earth/stone tone
  metallicFactor = 0.05,
  roughnessFactor = 0.85,
}) {
  const vertCount = vertices.length / 3;
  const indexCount = indices.length;

  const vertBuffer = Buffer.from(vertices.buffer, vertices.byteOffset, vertices.byteLength);
  const normBuffer = Buffer.from(normals.buffer, normals.byteOffset, normals.byteLength);
  const uvBuffer = Buffer.from(uvs.buffer, uvs.byteOffset, uvs.byteLength);
  const indexBuffer = Buffer.from(indices.buffer, indices.byteOffset, indices.byteLength);

  // Compute bounding box
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < vertices.length; i += 3) {
    minX = Math.min(minX, vertices[i]);
    minY = Math.min(minY, vertices[i + 1]);
    minZ = Math.min(minZ, vertices[i + 2]);
    maxX = Math.max(maxX, vertices[i]);
    maxY = Math.max(maxY, vertices[i + 1]);
    maxZ = Math.max(maxZ, vertices[i + 2]);
  }

  // Padding offsets to 4-byte boundaries
  const indexOffset = 0;
  const indexLength = indexBuffer.byteLength;
  const indexPadded = Math.ceil(indexLength / 4) * 4;

  const vertOffset = indexPadded;
  const vertLength = vertBuffer.byteLength;
  const vertPadded = Math.ceil(vertLength / 4) * 4;

  const normOffset = vertOffset + vertPadded;
  const normLength = normBuffer.byteLength;
  const normPadded = Math.ceil(normLength / 4) * 4;

  const uvOffset = normOffset + normPadded;
  const uvLength = uvBuffer.byteLength;
  const uvPadded = Math.ceil(uvLength / 4) * 4;

  const totalBinSize = uvOffset + uvPadded;
  const binBuffer = Buffer.alloc(totalBinSize);

  indexBuffer.copy(binBuffer, indexOffset);
  vertBuffer.copy(binBuffer, vertOffset);
  normBuffer.copy(binBuffer, normOffset);
  uvBuffer.copy(binBuffer, uvOffset);

  const gltfJson = {
    asset: {
      version: "2.0",
      generator: "ExploreX AI & Photogrammetry 3D Reconstruction Pipeline v2.0",
    },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name }],
    meshes: [
      {
        name,
        primitives: [
          {
            attributes: {
              POSITION: 1,
              NORMAL: 2,
              TEXCOORD_0: 3,
            },
            indices: 0,
            material: 0,
            mode: 4, // TRIANGLES
          },
        ],
      },
    ],
    materials: [
      {
        name: "ReconstructedMaterial",
        pbrMetallicRoughness: {
          baseColorFactor: baseColor,
          metallicFactor,
          roughnessFactor,
        },
        doubleSided: true,
      },
    ],
    accessors: [
      {
        bufferView: 0,
        byteOffset: 0,
        componentType: 5123, // UNSIGNED_SHORT
        count: indexCount,
        type: "SCALAR",
        min: [0],
        max: [vertCount - 1],
      },
      {
        bufferView: 1,
        byteOffset: 0,
        componentType: 5126, // FLOAT
        count: vertCount,
        type: "VEC3",
        min: [minX, minY, minZ],
        max: [maxX, maxY, maxZ],
      },
      {
        bufferView: 2,
        byteOffset: 0,
        componentType: 5126, // FLOAT
        count: vertCount,
        type: "VEC3",
        min: [-1, -1, -1],
        max: [1, 1, 1],
      },
      {
        bufferView: 3,
        byteOffset: 0,
        componentType: 5126, // FLOAT
        count: vertCount,
        type: "VEC2",
        min: [0, 0],
        max: [1, 1],
      },
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: indexOffset,
        byteLength: indexLength,
        target: 34963, // ELEMENT_ARRAY_BUFFER
      },
      {
        buffer: 0,
        byteOffset: vertOffset,
        byteLength: vertLength,
        target: 34962, // ARRAY_BUFFER
      },
      {
        buffer: 0,
        byteOffset: normOffset,
        byteLength: normLength,
        target: 34962, // ARRAY_BUFFER
      },
      {
        buffer: 0,
        byteOffset: uvOffset,
        byteLength: uvLength,
        target: 34962, // ARRAY_BUFFER
      },
    ],
    buffers: [
      {
        byteLength: totalBinSize,
      },
    ],
  };

  const jsonString = JSON.stringify(gltfJson);
  const jsonBuffer = Buffer.from(jsonString, "utf8");
  const jsonPadding = (4 - (jsonBuffer.length % 4)) % 4;
  const paddedJsonLength = jsonBuffer.length + jsonPadding;

  const totalLength = 12 + 8 + paddedJsonLength + 8 + totalBinSize;
  const glb = Buffer.alloc(totalLength);

  // GLB Header
  glb.writeUInt32LE(0x46546c67, 0); // "glTF"
  glb.writeUInt32LE(2, 4);          // version 2
  glb.writeUInt32LE(totalLength, 8);// total file length

  // Chunk 0 (JSON)
  glb.writeUInt32LE(paddedJsonLength, 12);
  glb.writeUInt32LE(0x4e4f534a, 16); // "JSON"
  jsonBuffer.copy(glb, 20);
  for (let i = 0; i < jsonPadding; i++) {
    glb.writeUInt8(0x20, 20 + jsonBuffer.length + i);
  }

  // Chunk 1 (BIN)
  const binChunkOffset = 20 + paddedJsonLength;
  glb.writeUInt32LE(totalBinSize, binChunkOffset);
  glb.writeUInt32LE(0x004e4942, binChunkOffset + 4); // "BIN\0"
  binBuffer.copy(glb, binChunkOffset + 8);

  return glb;
}

module.exports = { createGLB };
