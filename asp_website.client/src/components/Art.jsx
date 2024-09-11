import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useGLTF, useTexture, useAnimations } from '@react-three/drei';
//import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { PlaneGeometry, AnimationMixer } from 'three';

const geom = new PlaneGeometry(1, 1);

function Art(props) {

    function MyAnimatedBox() {
        const myMesh = React.useRef();

        useFrame(({ clock }) => {
            //console.log("Hey, I'm executing every frame!");
            //console.log(myMesh);
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

    const TestCube = (props) => {
        const mesh = useRef(null)
        const ref = useRef()
        const { nodes, animations } = useGLTF("./test_anim.glb")
        let mixer = new AnimationMixer(nodes)

        console.log("nodes: ");
        console.log(nodes);

        animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
        })
        useFrame((state, delta) => {
            mixer.update(delta);
        })

        return (
            <group ref={ref} {...props} dispose={null}>
                <group rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
                    <primitive object={nodes.Scene} />
                    <mesh
                        {...props}
                        ref={mesh}
                        //onClick={() => setIndex((index + 1) % names.length)}
                        geometry={nodes.Cube.geometry}
                        skeleton={nodes.Cube.skeleton}
                        //rotation={[-Math.PI / 2, 0, 0]}
                        scale={100}>
                        <meshStandardMaterial color='hotpink' />
                    </mesh>
                </group>
            </group>
        )
    }

    const Horse = (props) => {
        const mesh = useRef(null); // useRef is React's way of creating an object that can be held in memory 
        const [active, setActive] = useState(false);
        useFrame((state, delta) => {
            ((active) ? mesh.current.rotation.y += delta : mesh.current.rotation.y -= delta);
        });
        //const gltf = useLoader(GLTFLoader, "./horse.glb");
        const { nodes, animations } = useGLTF("./horse.glb");
        let mixer = new AnimationMixer(nodes);

        console.log("animations: ");
        console.log(animations);

        animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
        });
        useFrame((state, delta) => {
            mixer.update(delta);
        });

        console.log("nodes: ");
        console.log(nodes);

        // Extract animation actions
        const ref = useRef();
        //const { ref, actions, names } = useAnimations(animations);
        // Animation-index state
        //const [index, setIndex] = useState(4);

        //var mixer = new AnimationMixer(gltf.scene);

        // Change animation when the index changes
        //useEffect(() => {
        //    // Reset and fade in animation after an index has been changed
        //    actions[names[index]].reset().fadeIn(0.5).play()
        //    // In the clean-up phase, fade it out
        //    return () => actions[names[index]].fadeOut(0.5)
        //}, [index, actions, names])

    //    return (
    //        <mesh
    //            {...props}
    //            ref={mesh}
    //            onClick={(event) => setActive(!active)}
    //            onPointerOver={(event) => setHover(true)}
    //            onPointerOut={(event) => setHover(false)}>
    //        <primitive
    //            object={gltf.scene}
    //            scale={2.0}
    //            rotation={[0, Math.PI / 2, 0]}
    //            position={[0, -2, 0]} />
    //        <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    //        </mesh>
        //    );

        return (
            <group ref={ref} {...props} dispose={null}>
                <group rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
                    <primitive object={nodes.Scene} />
                    {/*<mesh*/}
                    {/*    {...props}*/}
                    {/*    ref={mesh}*/}
                    {/*    //onClick={() => setIndex((index + 1) % names.length)}*/}
                    {/*    geometry={nodes.Horse.geometry}*/}
                    {/*    skeleton={nodes.Horse.skeleton}*/}
                    {/*    rotation={[-Math.PI / 2, 0, 0]}*/}
                    {/*    scale={100}>*/}
                    {/*    <meshStandardMaterial color='orange' />*/}
                    {/*</mesh>*/}
                    <mesh
                        {...props}
                        ref={mesh}
                        //onClick={() => setIndex((index + 1) % names.length)}
                        geometry={nodes.Horse_1.geometry}
                        skeleton={nodes.Horse_1.skeleton}
                        rotation={[-Math.PI / 2, 0, 0]}
                        scale={100}>
                        <meshStandardMaterial color='hotpink' />
                    </mesh>
                    {/*<mesh*/}
                    {/*    {...props}*/}
                    {/*    ref={mesh}*/}
                    {/*    //onClick={() => setIndex((index + 1) % names.length)}*/}
                    {/*    geometry={nodes.Horse_2.geometry}*/}
                    {/*    skeleton={nodes.Horse_2.skeleton}*/}
                    {/*    rotation={[-Math.PI / 2, 0, 0]}*/}
                    {/*    scale={100}>*/}
                    {/*    <meshStandardMaterial color='hotpink' />*/}
                    {/*</mesh>*/}

                </group>
            </group>
        )
    };

    return (
        <div className="items-center border w-full h-screen">
            <div className="flex w-screen h-screen">
            <div>(work in progress)</div>
                <Canvas>
                    <ambientLight intensity={Math.PI / 2} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
                    <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
                    {/*<Horse />*/}
                    <TestCube />
                    <MyAnimatedBox />
                    {<Button3D position={[-4.0, 0, 0]} /> }
                </Canvas>
            </div>
        </div>
    );
}

export default Art;
