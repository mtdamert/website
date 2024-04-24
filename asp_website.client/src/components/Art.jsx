import React, { useRef, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { BoxGeometry, MeshStandardMaterial, PlaneGeometry } from 'three';
import Text3D from "./Text3D";

const geom = new PlaneGeometry(1, 1);

function Art(props) {

    function Button3D(props) {
        const mesh = useRef(null);
        const textMesh = useRef(null);
        const mat = useRef();
        const [hovered, setHover] = useState(false);
        const [active, setActive] = useState(false);

        return (
            <>
                <mesh
                    {...props}
                    ref={mesh}
                    scale={1}
                    onClick={(event) => setActive(true)}
                    onPointerOver={(event) => setHover(true)}
                    onPointerOut={(event) => setHover(false)}>
                    <boxGeometry args={[4, 1, 0.1]} />
                    <meshStandardMaterial color={hovered ? '#ffffff' : '#c0c0c0' } />
                </mesh>
                
                <mesh {...props} geometry={geom}>
                    <meshBasicMaterial ref={mat} />
                    {/*'A' && <Text3D size={5}>{'A'}</Text3D>*/}
                </mesh>
                
            </>
        );
    }

    const Horse = (props) => {
        const mesh = useRef(null);
        const [active, setActive] = useState(false);
        const [hovered, setHover] = useState(false);
        useFrame((state, delta) => {
            ((active) ? mesh.current.rotation.y += delta : mesh.current.rotation.y -= delta);
        });
        const gltf = useLoader(GLTFLoader, "./horse.glb");

        return (
            <mesh
                {...props}
                ref={mesh}
                onClick={(event) => setActive(!active)}
                onPointerOver={(event) => setHover(true)}
                onPointerOut={(event) => setHover(false)}>
            <primitive
                object={gltf.scene}
                scale={2.0}
                rotation={[0, Math.PI / 2, 0]}
                position={[0, -2, 0]} />
            <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
            </mesh>
        );
    };

    return (
        <div className="items-center border w-full h-screen">
            <div className="flex w-full h-screen">
                <Canvas>
                    <ambientLight intensity={Math.PI / 2} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
                    <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
                    <Horse />
                    {<Button3D position={[-4.0, 0, 0]} /> }
                </Canvas>
            </div>
        </div>
    );
}

export default Art;
