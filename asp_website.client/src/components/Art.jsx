import React, { useRef, useState } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { PlaneGeometry, AnimationMixer, Color, MeshStandardMaterial } from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import almendra from '../fonts/Almendra SC_Regular.json';

const geom = new PlaneGeometry(1, 1);

extend({ TextGeometry });

function Art(props) {

    const font = new FontLoader().parse(almendra);

    function MyAnimatedBox(props) {
        const myMesh = React.useRef();

        useFrame(({ clock }) => {
            //console.log("Hey, I'm executing every frame!");
            //console.log(myMesh);
            myMesh.current.rotation.x = clock.getElapsedTime();
        })

        return (
            <mesh {...props}
                ref={myMesh}>
                <boxGeometry />
                <meshBasicMaterial color="royalblue" />
            </mesh>
        )
    }

    function Button3D(props) {
        const mesh = useRef(null);
        const [hovered, setHover] = useState(false);
        const [active, setActive] = useState(false);

        const makeButtonActive = () => {
            setActive(true);
        }

        return (
            <>
                <mesh
                    {...props}
                    ref={mesh}
                    onClick={() => { props.onClick(); makeButtonActive(); }}
                    onPointerOver={(event) => setHover(true)}
                    onPointerOut={(event) => setHover(false)}>
                    <boxGeometry args={[4, 1, 0.1]} />
                    <meshStandardMaterial color={hovered ? (active ? '#ff8080' : '#ffffff') : (active ? '#ff0000' : '#c0c0c0') } />
                </mesh>
                
                <mesh {...props}>
                    <textGeometry args={[(props.text), { font, size: 0.4, height: 0.1 }]} />
                    <meshStandardMaterial color={ (active ? '#000000' : '#808080')} />
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
            <div className="w-full">(work in progress)</div>
            <div id="hiddenDiv" className="invisible">Hello, World!</div>
            <div className="flex w-screen h-screen">
                <Canvas>
                    <ambientLight intensity={Math.PI / 2} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
                    <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
                    <Horse />
                    <TestCube />
                    {<MyAnimatedBox scale={0.1} position={[-1.0, -1.0, 0.0]} />}

                    {<Button3D scale={0.25} position={[-6.0, 1.6, 0]}
                        onClick={(event) => { console.log("Hello World should appear"); document.getElementById('hiddenDiv').style.visibility = 'visible'; }}
                        text={'Option 0'} />}
                    {<Button3D scale={0.25} position={[-6.0, 1.2, 0]} text={'Option 1'} />}
                    {<Button3D scale={0.25} position={[-6.0, 0.8, 0]} text={'Option 2'} />}
                    {<Button3D scale={0.25} position={[-6.0, 0.4, 0]} text={'Option 3'} />}
                    {<Button3D scale={0.25} position={[-6.0, 0, 0]} text={'Option 4'} /> }
                </Canvas>
            </div>
        </div>
    );
}

export default Art;
