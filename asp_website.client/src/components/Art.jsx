import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { PlaneGeometry, AnimationMixer, Color } from 'three';

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
        const mixer = new AnimationMixer(nodes.Scene)

        // Load and play all animations
        animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
        })
        // Just load the first animation
        // mixer.clipAction(animations[0]).play()

        // Update the animation mixer object with the delta in time each frame
        useFrame((state, delta) => {
            mixer.update(delta);
        });

        nodes.Cube.material.color = new Color(1, 0.3, 0)

        return (
            <group ref={ref} {...props} dispose={null}>
                <group>
                    <primitive ref={mesh} object={nodes.Scene} dispose={null} scale={0.1} position={[0, -0.5, 0]} />
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
        const { nodes, animations } = useGLTF("./horse.glb");
        let mixer = new AnimationMixer(nodes.Scene);

        animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
        });
        useFrame((state, delta) => {
            mixer.update(delta);
        });

        // Extract animation actions
        const ref = useRef();

        return (
            <group ref={ref} {...props} dispose={null}>
                <group>
                    <primitive ref={mesh} object={nodes.Scene} dispose={null} />

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
                    {/*<mesh*/}
                    {/*    {...props}*/}
                    {/*    ref={mesh}*/}
                    {/*    //onClick={() => setIndex((index + 1) % names.length)}*/}
                    {/*    geometry={nodes.Horse_1.geometry}*/}
                    {/*    skeleton={nodes.Horse_1.skeleton}*/}
                    {/*    rotation={[-Math.PI / 2, 0, 0]}*/}
                    {/*    scale={100}>*/}
                    {/*    <meshStandardMaterial color='hotpink' />*/}
                    {/*</mesh>*/}
                    {/*<mesh*/}
                    {/*    {...props}*/}
                    {/*    ref={mesh}*/}
                    {/*    //onClick={() => setIndex((index + 1) % names.length)}*/}
                    {/*    geometry={nodes.Scene.geometry}*/}
                    {/*    skeleton={nodes.Scene.skeleton}*/}
                    {/*    rotation={[-Math.PI / 2, 0, 0]}*/}
                    {/*    scale={100}>*/}
                    {/*    <meshStandardMaterial color='hotpink' />*/}
                    {/*</mesh>*/}

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
                    <Horse />
                    <TestCube />
                    {/*<MyAnimatedBox />*/}
                    {<Button3D position={[-4.0, 0, 0]} /> }
                </Canvas>
            </div>
        </div>
    );
}

export default Art;
