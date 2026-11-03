import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

// Reusable 3D Hotspot Pin
export function HotspotMarker({ position, label, isActive, onClick }) {
  const pinRef = useRef();

  useFrame((state) => {
    if (pinRef.current) {
      // Gentle floating animation
      pinRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2.5 + position[0]) * 0.08;
    }
  });

  return (
    <group ref={pinRef} position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Outer pulsing ring */}
      <mesh>
        <sphereGeometry args={[isActive ? 0.22 : 0.16, 16, 16]} />
        <meshStandardMaterial
          color={isActive ? "#b47a45" : "#174c3c"}
          emissive={isActive ? "#b47a45" : "#174c3c"}
          emissiveIntensity={isActive ? 0.8 : 0.4}
          roughness={0.2}
        />
      </mesh>
      {/* Inner beacon point */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// ================= 1. TAJ MAHAL 3D MODEL =================
export function TajMahalModel({ onHotspotClick, activeHotspot }) {
  const marbleMat = { color: "#fafaf6", roughness: 0.25, metalness: 0.05 };
  const trimMat = { color: "#3a3835", roughness: 0.4, metalness: 0.1 };
  const waterMat = { color: "#227b87", roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.85 };

  return (
    <group position={[0, -0.6, 0]}>
      {/* Red sandstone platform base */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[11, 0.3, 11]} />
        <meshStandardMaterial color="#944237" roughness={0.8} />
      </mesh>

      {/* Raised white marble plinth */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[7.8, 0.5, 7.8]} />
        <meshStandardMaterial {...marbleMat} />
      </mesh>

      {/* Main Square Tomb with chamfered corners */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[4.2, 2.6, 4.2]} />
        <meshStandardMaterial {...marbleMat} />
      </mesh>

      {/* 4 Grand Pishtaq (Iwan) recessed portals on 4 faces */}
      {[[0, 1.7, 2.12], [0, 1.7, -2.12], [2.12, 1.7, 0], [-2.12, 1.7, 0]].map((pos, i) => (
        <group key={i} position={pos} rotation={[0, (i * Math.PI) / 2, 0]}>
          <mesh>
            <boxGeometry args={[1.8, 2.1, 0.15]} />
            <meshStandardMaterial {...trimMat} />
          </mesh>
          <mesh position={[0, 0.1, 0.05]}>
            <boxGeometry args={[1.4, 1.7, 0.1]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Central High Onion Dome */}
      <mesh position={[0, 3.8, 0]}>
        <sphereGeometry args={[1.45, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <meshStandardMaterial {...marbleMat} />
      </mesh>
      {/* Cylindrical drum beneath dome */}
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.6, 32]} />
        <meshStandardMaterial {...marbleMat} />
      </mesh>
      {/* Golden finial atop main dome */}
      <mesh position={[0, 5.0, 0]}>
        <coneGeometry args={[0.08, 0.7, 12]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 4 Chattris (domed kiosks) around central dome */}
      {[[-1.5, 3.3, -1.5], [1.5, 3.3, -1.5], [-1.5, 3.3, 1.5], [1.5, 3.3, 1.5]].map((pos, i) => (
        <group key={i} position={pos}>
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.42, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial {...marbleMat} />
          </mesh>
          {/* Chattri pillars */}
          {[-0.25, 0.25].map((cx) =>
            [-0.25, 0.25].map((cz) => (
              <mesh key={`${cx}-${cz}`} position={[cx, 0.05, cz]}>
                <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
                <meshStandardMaterial {...marbleMat} />
              </mesh>
            ))
          )}
        </group>
      ))}

      {/* 4 Corner Minarets (three-tiered with balconies) */}
      {[[-3.4, 0, -3.4], [3.4, 0, -3.4], [-3.4, 0, 3.4], [3.4, 0, 3.4]].map((pos, i) => (
        <group key={i} position={pos}>
          {/* Base */}
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.34, 0.4, 0.7, 16]} />
            <meshStandardMaterial {...marbleMat} />
          </mesh>
          {/* Tier 1 */}
          <mesh position={[0, 1.7, 0]}>
            <cylinderGeometry args={[0.26, 0.32, 1.5, 16]} />
            <meshStandardMaterial {...marbleMat} />
          </mesh>
          {/* Balcony 1 */}
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.1, 16]} />
            <meshStandardMaterial {...trimMat} />
          </mesh>
          {/* Tier 2 */}
          <mesh position={[0, 3.15, 0]}>
            <cylinderGeometry args={[0.22, 0.25, 1.2, 16]} />
            <meshStandardMaterial {...marbleMat} />
          </mesh>
          {/* Balcony 2 */}
          <mesh position={[0, 3.8, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.08, 16]} />
            <meshStandardMaterial {...trimMat} />
          </mesh>
          {/* Tier 3 */}
          <mesh position={[0, 4.3, 0]}>
            <cylinderGeometry args={[0.18, 0.21, 0.9, 16]} />
            <meshStandardMaterial {...marbleMat} />
          </mesh>
          {/* Cupola dome */}
          <mesh position={[0, 4.9, 0]}>
            <sphereGeometry args={[0.25, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
            <meshStandardMaterial {...marbleMat} />
          </mesh>
        </group>
      ))}

      {/* Reflecting Pool in front */}
      <mesh position={[0, 0.01, 7]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 5.5]} />
        <meshStandardMaterial {...waterMat} />
      </mesh>
    </group>
  );
}

// ================= 2. CHARMINAR 3D MODEL =================
export function CharminarModel() {
  const stuccoMat = { color: "#d8c4a5", roughness: 0.7, metalness: 0.08 };
  const archDark = { color: "#2d2822", roughness: 0.9 };

  return (
    <group position={[0, -0.6, 0]}>
      {/* Plinth */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[6.8, 0.2, 6.8]} />
        <meshStandardMaterial color="#8f7f6f" roughness={0.8} />
      </mesh>

      {/* Main Square Building Block */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[5.2, 3.2, 5.2]} />
        <meshStandardMaterial {...stuccoMat} />
      </mesh>

      {/* 4 Grand Arches through building */}
      {[[0, 1.5, 2.65], [0, 1.5, -2.65], [2.65, 1.5, 0], [-2.65, 1.5, 0]].map((pos, i) => (
        <group key={i} position={pos} rotation={[0, (i * Math.PI) / 2, 0]}>
          <mesh>
            <boxGeometry args={[2.8, 2.6, 0.2]} />
            <meshStandardMaterial {...archDark} />
          </mesh>
        </group>
      ))}

      {/* Upper Double-Deck Balcony Gallery */}
      <mesh position={[0, 3.6, 0]}>
        <boxGeometry args={[5.6, 0.35, 5.6]} />
        <meshStandardMaterial {...stuccoMat} />
      </mesh>
      <mesh position={[0, 4.05, 0]}>
        <boxGeometry args={[4.8, 0.55, 4.8]} />
        <meshStandardMaterial {...stuccoMat} />
      </mesh>

      {/* 4 Fluted Grand Minarets at 4 corners */}
      {[[-2.4, 0, -2.4], [2.4, 0, -2.4], [-2.4, 0, 2.4], [2.4, 0, 2.4]].map((pos, i) => (
        <group key={i} position={pos}>
          {/* Base */}
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.5, 0.55, 3.0, 20]} />
            <meshStandardMaterial {...stuccoMat} />
          </mesh>
          {/* Tier 1 Balcony */}
          <mesh position={[0, 3.2, 0]}>
            <cylinderGeometry args={[0.68, 0.68, 0.18, 20]} />
            <meshStandardMaterial color="#b89f7f" roughness={0.6} />
          </mesh>
          {/* Tier 2 Shaft */}
          <mesh position={[0, 4.1, 0]}>
            <cylinderGeometry args={[0.42, 0.46, 1.6, 20]} />
            <meshStandardMaterial {...stuccoMat} />
          </mesh>
          {/* Tier 2 Balcony */}
          <mesh position={[0, 5.0, 0]}>
            <cylinderGeometry args={[0.58, 0.58, 0.16, 20]} />
            <meshStandardMaterial color="#b89f7f" roughness={0.6} />
          </mesh>
          {/* Tier 3 Shaft */}
          <mesh position={[0, 5.7, 0]}>
            <cylinderGeometry args={[0.34, 0.38, 1.2, 20]} />
            <meshStandardMaterial {...stuccoMat} />
          </mesh>
          {/* Bulbous finial dome */}
          <mesh position={[0, 6.45, 0]}>
            <sphereGeometry args={[0.45, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
            <meshStandardMaterial color="#c4ab89" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ================= 3. RED FORT 3D MODEL =================
export function RedFortModel() {
  const sandstone = { color: "#a3362a", roughness: 0.82, metalness: 0.05 };
  const marbleChattri = { color: "#f3ede3", roughness: 0.35 };

  return (
    <group position={[0, -0.6, 0]}>
      {/* Massive defensive bastion wall */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[9.5, 2.4, 2.4]} />
        <meshStandardMaterial {...sandstone} />
      </mesh>

      {/* Crenellated battlements along wall top */}
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh key={i} position={[(i - 7) * 0.62, 2.5, 1.1]}>
          <boxGeometry args={[0.32, 0.3, 0.2]} />
          <meshStandardMaterial {...sandstone} />
        </mesh>
      ))}

      {/* Lahore Gate Grand Portal */}
      <mesh position={[0, 1.8, 1.4]}>
        <boxGeometry args={[3.2, 3.2, 0.8]} />
        <meshStandardMaterial {...sandstone} />
      </mesh>
      {/* Recessed entry arch */}
      <mesh position={[0, 1.2, 1.85]}>
        <boxGeometry args={[1.8, 2.2, 0.2]} />
        <meshStandardMaterial color="#1f1816" roughness={0.9} />
      </mesh>

      {/* Twin octagonal towers flanking gate */}
      {[-2.2, 2.2].map((x, i) => (
        <group key={i} position={[x, 0, 1.4]}>
          <mesh position={[0, 2.2, 0]}>
            <cylinderGeometry args={[0.85, 0.95, 4.4, 8]} />
            <meshStandardMaterial {...sandstone} />
          </mesh>
          {/* Tower Chattri */}
          <mesh position={[0, 4.8, 0]}>
            <sphereGeometry args={[0.65, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial {...marbleChattri} />
          </mesh>
        </group>
      ))}

      {/* 7 Decorative Marble Chattris over Central Parapet */}
      {[-1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2].map((x, i) => (
        <group key={i} position={[x, 3.6, 1.4]}>
          <mesh position={[0, 0.25, 0]}>
            <sphereGeometry args={[0.2, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial {...marbleChattri} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ================= 4. HAWA MAHAL 3D MODEL =================
export function HawaMahalModel() {
  const pinkStone = { color: "#d9786a", roughness: 0.72, metalness: 0.08 };
  const whiteJali = { color: "#f8f2eb", roughness: 0.4 };

  return (
    <group position={[0, -0.6, 0]}>
      {/* Base platform */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[8.5, 0.3, 2.8]} />
        <meshStandardMaterial color="#914d42" roughness={0.8} />
      </mesh>

      {/* Tier 1 (Widest base) */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[7.8, 1.2, 1.6]} />
        <meshStandardMaterial {...pinkStone} />
      </mesh>

      {/* Tier 2 */}
      <mesh position={[0, 2.0, -0.05]}>
        <boxGeometry args={[6.6, 1.0, 1.4]} />
        <meshStandardMaterial {...pinkStone} />
      </mesh>

      {/* Tier 3 */}
      <mesh position={[0, 2.9, -0.1]}>
        <boxGeometry args={[5.2, 0.9, 1.2]} />
        <meshStandardMaterial {...pinkStone} />
      </mesh>

      {/* Tier 4 */}
      <mesh position={[0, 3.7, -0.15]}>
        <boxGeometry args={[3.8, 0.8, 1.0]} />
        <meshStandardMaterial {...pinkStone} />
      </mesh>

      {/* Tier 5 (Crowning Top) */}
      <mesh position={[0, 4.4, -0.2]}>
        <boxGeometry args={[2.2, 0.7, 0.8]} />
        <meshStandardMaterial {...pinkStone} />
      </mesh>

      {/* Stepped Rajput Chattris on Pyramid Summit */}
      <mesh position={[0, 5.0, -0.2]}>
        <coneGeometry args={[0.9, 0.6, 16]} />
        <meshStandardMaterial {...pinkStone} />
      </mesh>
      {[-1.0, 1.0].map((x, i) => (
        <mesh key={i} position={[x, 4.8, -0.2]}>
          <coneGeometry args={[0.4, 0.45, 12]} />
          <meshStandardMaterial {...pinkStone} />
        </mesh>
      ))}

      {/* Array of 953 projecting Jharokha lattice balconies */}
      {Array.from({ length: 9 }).map((_, j) => (
        <group key={j} position={[(j - 4) * 0.75, 1.5, 0.85]}>
          <mesh>
            <cylinderGeometry args={[0.26, 0.26, 0.5, 8]} />
            <meshStandardMaterial {...pinkStone} />
          </mesh>
          <mesh position={[0, 0, 0.12]}>
            <boxGeometry args={[0.2, 0.28, 0.05]} />
            <meshStandardMaterial {...whiteJali} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 7 }).map((_, j) => (
        <group key={j} position={[(j - 3) * 0.75, 2.5, 0.75]}>
          <mesh>
            <cylinderGeometry args={[0.24, 0.24, 0.45, 8]} />
            <meshStandardMaterial {...pinkStone} />
          </mesh>
          <mesh position={[0, 0, 0.11]}>
            <boxGeometry args={[0.18, 0.24, 0.05]} />
            <meshStandardMaterial {...whiteJali} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 5 }).map((_, j) => (
        <group key={j} position={[(j - 2) * 0.75, 3.4, 0.65]}>
          <mesh>
            <cylinderGeometry args={[0.22, 0.22, 0.4, 8]} />
            <meshStandardMaterial {...pinkStone} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ================= 5. INDIA GATE 3D MODEL =================
export function IndiaGateModel() {
  const sandstoneMat = { color: "#cfb08c", roughness: 0.78, metalness: 0.05 };
  const archInner = { color: "#25211c", roughness: 0.95 };

  return (
    <group position={[0, -0.6, 0]}>
      {/* Stepped Base Plinth */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[7.2, 0.3, 4.4]} />
        <meshStandardMaterial color="#947a5a" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[6.4, 0.3, 3.8]} />
        <meshStandardMaterial {...sandstoneMat} />
      </mesh>

      {/* Main Arch Structure - Left Pier */}
      <mesh position={[-1.75, 2.4, 0]}>
        <boxGeometry args={[1.7, 3.6, 2.8]} />
        <meshStandardMaterial {...sandstoneMat} />
      </mesh>

      {/* Main Arch Structure - Right Pier */}
      <mesh position={[1.75, 2.4, 0]}>
        <boxGeometry args={[1.7, 3.6, 2.8]} />
        <meshStandardMaterial {...sandstoneMat} />
      </mesh>

      {/* Arch Interior Void */}
      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[1.8, 3.0, 2.82]} />
        <meshStandardMaterial {...archInner} />
      </mesh>

      {/* Arch Vault Ceiling */}
      <mesh position={[0, 3.7, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 2.8, 20, 1, false, 0, Math.PI]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial {...sandstoneMat} />
      </mesh>

      {/* Main Arch Entablature & Cornice */}
      <mesh position={[0, 4.4, 0]}>
        <boxGeometry args={[5.6, 0.6, 3.1]} />
        <meshStandardMaterial {...sandstoneMat} />
      </mesh>

      {/* Upper Inscribed Attic ("INDIA") */}
      <mesh position={[0, 5.0, 0]}>
        <boxGeometry args={[4.8, 0.7, 2.5]} />
        <meshStandardMaterial color="#bda07e" roughness={0.7} />
      </mesh>

      {/* Shallow Bowl / Urn finial on roof */}
      <mesh position={[0, 5.5, 0]}>
        <cylinderGeometry args={[0.8, 0.4, 0.3, 24]} />
        <meshStandardMaterial color="#826c52" roughness={0.6} />
      </mesh>

      {/* Amar Jawan Jyoti Memorial Cenotaph in archway */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.7, 0.4, 0.7]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.6} />
      </mesh>
      {/* Eternal flame beacon */}
      <mesh position={[0, 1.15, 0]}>
        <coneGeometry args={[0.08, 0.25, 8]} />
        <meshBasicMaterial color="#ff9900" />
      </mesh>
    </group>
  );
}

// ================= 6. MYSORE PALACE 3D MODEL =================
export function MysorePalaceModel() {
  const graniteMat = { color: "#aba69d", roughness: 0.7, metalness: 0.05 };
  const pinkDomeMat = { color: "#b84f60", roughness: 0.35, metalness: 0.1 };
  const goldFinial = { color: "#d4af37", roughness: 0.2, metalness: 0.8 };

  return (
    <group position={[0, -0.6, 0]}>
      {/* Broad granite plinth */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[10.5, 0.4, 5.5]} />
        <meshStandardMaterial color="#78736a" roughness={0.8} />
      </mesh>

      {/* Main Palace Three-Storey Central Block */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[8.8, 2.8, 3.8]} />
        <meshStandardMaterial {...graniteMat} />
      </mesh>

      {/* Facade Arcades with Ornate Pillars */}
      {Array.from({ length: 9 }).map((_, i) => (
        <group key={i} position={[(i - 4) * 0.95, 1.2, 1.95]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, 1.6, 12]} />
            <meshStandardMaterial color="#948e84" roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Central Five-Storey Tower */}
      <mesh position={[0, 3.8, 0]}>
        <boxGeometry args={[2.8, 1.8, 2.8]} />
        <meshStandardMaterial {...graniteMat} />
      </mesh>

      {/* Magnificent Central Pink Marble Dome */}
      <mesh position={[0, 5.2, 0]}>
        <sphereGeometry args={[1.35, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <meshStandardMaterial {...pinkDomeMat} />
      </mesh>
      {/* Tall Gold Finial */}
      <mesh position={[0, 6.3, 0]}>
        <coneGeometry args={[0.1, 0.7, 12]} />
        <meshStandardMaterial {...goldFinial} />
      </mesh>

      {/* 4 Corner Octagonal Towers with Pink Domes */}
      {[[-4.1, 0, -1.6], [4.1, 0, -1.6], [-4.1, 0, 1.6], [4.1, 0, 1.6]].map((pos, i) => (
        <group key={i} position={pos}>
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.65, 0.72, 4.2, 8]} />
            <meshStandardMaterial {...graniteMat} />
          </mesh>
          <mesh position={[0, 4.9, 0]}>
            <sphereGeometry args={[0.68, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
            <meshStandardMaterial {...pinkDomeMat} />
          </mesh>
          <mesh position={[0, 5.5, 0]}>
            <coneGeometry args={[0.06, 0.4, 8]} />
            <meshStandardMaterial {...goldFinial} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ================= 7. KONARK SUN TEMPLE 3D MODEL =================
export function KonarkTempleModel() {
  const khondaliteStone = { color: "#7a6e60", roughness: 0.88, metalness: 0.05 };
  const darkDetail = { color: "#4f453a", roughness: 0.95 };

  return (
    <group position={[0, -0.6, 0]}>
      {/* Vast Temple Platform Base (Chariot Base) */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[9.5, 0.7, 7.5]} />
        <meshStandardMaterial {...khondaliteStone} />
      </mesh>

      {/* 24 Carved Sun Chariot Wheels along the sides */}
      {[-3.2, -1.6, 0, 1.6, 3.2].map((x, i) => (
        <React.Fragment key={i}>
          {/* South side wheels */}
          <group position={[x, 0.6, 3.8]}>
            <mesh rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.55, 0.55, 0.12, 16]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial {...darkDetail} />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.15, 0.15, 0.16, 12]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color="#2d2822" />
            </mesh>
          </group>
          {/* North side wheels */}
          <group position={[x, 0.6, -3.8]}>
            <mesh rotation={[0, 0, 0]}>
              <cylinderGeometry args={[0.55, 0.55, 0.12, 16]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial {...darkDetail} />
            </mesh>
          </group>
        </React.Fragment>
      ))}

      {/* Main Jagamohana (Audience Hall) Square Sanctuary */}
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[4.8, 1.5, 4.8]} />
        <meshStandardMaterial {...khondaliteStone} />
      </mesh>

      {/* Three Stepped Pyramidal Tiers (Pidha Deula) */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[4.2, 0.7, 4.2]} />
        <meshStandardMaterial {...khondaliteStone} />
      </mesh>
      <mesh position={[0, 3.3, 0]}>
        <boxGeometry args={[3.2, 0.6, 3.2]} />
        <meshStandardMaterial {...khondaliteStone} />
      </mesh>
      <mesh position={[0, 4.0, 0]}>
        <boxGeometry args={[2.2, 0.5, 2.2]} />
        <meshStandardMaterial {...khondaliteStone} />
      </mesh>

      {/* Crowning Amalaka (Grooved Stone Disc) & Kalasha */}
      <mesh position={[0, 4.5, 0]}>
        <cylinderGeometry args={[0.9, 0.7, 0.4, 24]} />
        <meshStandardMaterial color="#5e5449" roughness={0.8} />
      </mesh>
      <mesh position={[0, 4.9, 0]}>
        <sphereGeometry args={[0.3, 16, 12]} />
        <meshStandardMaterial color="#4a4238" roughness={0.7} />
      </mesh>

      {/* Front Entrance Staircase & 7 Galloping War Horses */}
      <mesh position={[0, 0.35, 4.5]}>
        <boxGeometry args={[2.5, 0.5, 1.8]} />
        <meshStandardMaterial {...khondaliteStone} />
      </mesh>
      {[-0.8, -0.3, 0.3, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 0.85, 4.8]}>
          <boxGeometry args={[0.22, 0.5, 0.6]} />
          <meshStandardMaterial {...darkDetail} />
        </mesh>
      ))}
    </group>
  );
}
