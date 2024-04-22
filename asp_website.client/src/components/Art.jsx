import React, { useRef, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function Art(props) {

    function Box(props) {
        const mesh = useRef(null)
        const [hovered, setHover] = useState(false)
        const [active, setActive] = useState(false)
        useFrame((state, delta) => (mesh.current.rotation.x += delta))
        return (
            <mesh
                {...props}
                ref={mesh}
                scale={active ? 1.5 : 1}
                onClick={(event) => setActive(!active)}
                onPointerOver={(event) => setHover(true)}
                onPointerOut={(event) => setHover(false)}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
            </mesh>
        )
    }

    const Horse = (props) => {
        const mesh = useRef(null);
        const [active, setActive] = useState(false);
        const [hovered, setHover] = useState(false);
        //useFrame((state, delta) => ( mesh.current.rotation.y += delta ));
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
        <div className="flex items-center px-3 py-1.5 border w-full h-full">
            <div className="flex w-full h-96">
                <Canvas>
                    <ambientLight intensity={Math.PI / 2} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
                    <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
                    <Horse />
                    {/*<Box position={[-1.2, 0, 0]} />*/}
                    {/*<Box position={[1.2, 0, 0]} />*/}
                </Canvas>
            </div>
        </div>
    );
}

export default Art;

