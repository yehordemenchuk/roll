import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Mesh, Quaternion, Vector3 } from 'three';
import type { Cell } from './constants';
import { toWorld } from './constants';

const CUBE_SIZE = 0.86;
const CUBE_Y = 0.67;
const ROLL_DURATION_MS = 220;

function RollCube({ cube }: { cube: Cell }) {
  const meshRef = useRef<Mesh>(null);
  const previousCellRef = useRef<Cell | null>(null);

  const currentPosRef = useRef(new Vector3());
  const currentQuatRef = useRef(new Quaternion());

  const startPosRef = useRef(new Vector3());
  const targetPosRef = useRef(new Vector3());
  const startQuatRef = useRef(new Quaternion());
  const targetQuatRef = useRef(new Quaternion());
  const animationStartRef = useRef(0);
  const animatingRef = useRef(false);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const world = toWorld(cube);
    const nextPos = new Vector3(world.x, CUBE_Y, world.z);
    const prevCell = previousCellRef.current;

    if (!prevCell) {
      mesh.position.copy(nextPos);
      mesh.quaternion.identity();
      currentPosRef.current.copy(nextPos);
      currentQuatRef.current.identity();
      previousCellRef.current = { ...cube };
      return;
    }

    const dx = cube.x - prevCell.x;
    const dy = cube.y - prevCell.y;
    const isStep = Math.abs(dx) + Math.abs(dy) === 1;

    if (!isStep) {
      mesh.position.copy(nextPos);
      mesh.quaternion.identity();
      currentPosRef.current.copy(nextPos);
      currentQuatRef.current.identity();
      previousCellRef.current = { ...cube };
      return;
    }

    const rollAxis =
      dx === 1
        ? new Vector3(0, 0, -1)
        : dx === -1
          ? new Vector3(0, 0, 1)
          : dy === 1
            ? new Vector3(1, 0, 0)
            : new Vector3(-1, 0, 0);

    startPosRef.current.copy(currentPosRef.current);
    targetPosRef.current.copy(nextPos);

    startQuatRef.current.copy(currentQuatRef.current);
    const delta = new Quaternion().setFromAxisAngle(rollAxis, Math.PI / 2);
    // Otáčame podľa svetovej osi smeru pohybu, nie podľa lokálnej osi kocky.
    targetQuatRef.current.copy(currentQuatRef.current).premultiply(delta);

    animationStartRef.current = performance.now();
    animatingRef.current = true;
    previousCellRef.current = { ...cube };
  }, [cube]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (!animatingRef.current) {
      mesh.position.copy(currentPosRef.current);
      mesh.quaternion.copy(currentQuatRef.current);
      return;
    }

    const elapsed = performance.now() - animationStartRef.current;
    const t = Math.min(1, elapsed / ROLL_DURATION_MS);
    const eased = 1 - Math.pow(1 - t, 3);

    mesh.position.lerpVectors(startPosRef.current, targetPosRef.current, eased);
    mesh.quaternion.slerpQuaternions(startQuatRef.current, targetQuatRef.current, eased);

    if (t >= 1) {
      animatingRef.current = false;
      currentPosRef.current.copy(targetPosRef.current);
      currentQuatRef.current.copy(targetQuatRef.current);
      mesh.position.copy(currentPosRef.current);
      mesh.quaternion.copy(currentQuatRef.current);
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
      <meshStandardMaterial color="#f1c840" metalness={0.06} roughness={0.48} />
    </mesh>
  );
}

export function GameScene({
  cube,
  tiles,
  goal,
}: {
  cube: Cell;
  tiles: Cell[];
  goal: Cell;
}) {
  return (
    <Canvas shadows camera={{ position: [0, 6.2, 8.2], fov: 44 }}>
      <color attach="background" args={['#2c2484']} />
      <ambientLight intensity={0.45} />
      <directionalLight
        castShadow
        intensity={1.25}
        position={[4, 9, 6]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight intensity={0.35} position={[-6, 4, -4]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#312897" />
      </mesh>

      {tiles.map((tile) => {
        const p = toWorld(tile);
        const isGoal = tile.x === goal.x && tile.y === goal.y;
        return (
          <group key={`${tile.x}-${tile.y}`} position={[p.x, 0, p.z]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1, 0.45, 1]} />
              <meshStandardMaterial color="#9488e6" />
            </mesh>
            <mesh position={[0, -0.24, 0]} receiveShadow>
              <boxGeometry args={[1, 0.06, 1]} />
              <meshStandardMaterial color="#6d57d6" />
            </mesh>
            {isGoal ? (
              <mesh position={[0.22, 0.24, -0.22]}>
                <boxGeometry args={[0.38, 0.04, 0.38]} />
                <meshStandardMaterial color="#f3cd44" emissive="#f3cd44" emissiveIntensity={0.25} />
              </mesh>
            ) : null}
          </group>
        );
      })}

      <RollCube cube={cube} />

      <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={1.22} minPolarAngle={1.22} />
    </Canvas>
  );
}
