import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { BoxGeometry, MeshStandardMaterial, PlaneGeometry, AnimationMixer } from 'three';

const geom = new PlaneGeometry(1, 1);

function Art(props) {

    function MyAnimatedBox() {
        const myMesh = React.useRef();

        useFrame(({ clock }) => {
            console.log("Hey, I'm executing every frame!");
            console.log(myMesh);
            myMesh.current.rotation.x = clock.getElapsedTime();
        })

        return (
            <mesh ref={myMesh}>
                <boxGeometry />
                <meshBasicMaterial color="royalblue" />
            </mesh>
        )
    }

    function Button3D(props) {
        const mesh = useRef(null);
        //const textMesh = useRef(null);
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

        //const { nodes, animations } = useGLTF("/horse.glb")

        // Extract animation actions
        //const { ref, actions, names } = useAnimations(animations)
        // Animation-index state
        //const [index, setIndex] = useState(4)

        //var mixer = new AnimationMixer(gltf.scene);

        // Change animation when the index changes
        //useEffect(() => {
        //    // Reset and fade in animation after an index has been changed
        //    actions[names[index]].reset().fadeIn(0.5).play()
        //    // In the clean-up phase, fade it out
        //    return () => actions[names[index]].fadeOut(0.5)
        //}, [index, actions, names])

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
            <div className="flex w-screen h-screen">
            <div>(work in progress)</div>
                <Canvas>
                    <ambientLight intensity={Math.PI / 2} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
                    <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
                    <Horse />
                    <MyAnimatedBox />
                    {<Button3D position={[-4.0, 0, 0]} /> }
                </Canvas>
            </div>
        </div>
    );
}

export default Art;
