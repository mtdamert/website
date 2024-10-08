import React, { useRef, useState } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { useGLTF, GradientTexture } from '@react-three/drei';
import { AnimationMixer, Color, DoubleSide } from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import almendra from '../fonts/Almendra SC_Regular.json';

extend({ TextGeometry });

function Art(props) {

    const font = new FontLoader().parse(almendra);
    const [hideMenu, setHideMenu] = useState(false);

    function GroundPlane(props) {
        const myMesh = useRef();

        //useFrame(({ clock }) => {
        //    myMesh.current.rotation.x = clock.getElapsedTime();
        //})

        return (
            <mesh {...props} ref={myMesh}>
                <planeGeometry />
                <meshBasicMaterial color={[0.4, 0.2, 0.1]} side={DoubleSide} />
            </mesh>
        )
    }

    function MyAnimatedBox(props) {
        const myMesh = useRef();

        useFrame(({ clock }) => {
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
                    onPointerOut={(event) => setHover(false)}
                    visible={!hideMenu}>
                    <boxGeometry args={[4, 1, 0.1]} />
                    {/*<meshStandardMaterial color={hovered ? (active ? '#ff8080' : '#ffffff') : (active ? '#ff0000' : '#c0c0c0') } />*/}
                    <meshBasicMaterial>
                        <GradientTexture
                            stops={[0, 0.4, 0.6, 1]}
                            colors={hovered ? ['teal', 'fuchsia', 'fuchsia', 'teal'] : ['#66b2b2', 'hotpink', 'hotpink', '#66b2b2']}
                            size={1024}
                        />
                    </meshBasicMaterial>

                </mesh>
                
                <mesh
                    {...props}
                    position={[props.position[0] - 0.2, props.position[1] - 0.05, props.position[2]]}
                    visible={!hideMenu}>
                    <textGeometry args={[(props.text), { font, size: 0.4, depth: 0.1,  }]} />
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
                    <primitive ref={mesh} object={nodes.Scene} dispose={null}  />
                </group>
            </group>
        )
    }

    const Horse = (props) => {
        const mesh = useRef(null); // useRef is React's way of creating an object that can be held in memory 
        const [active, setActive] = useState(true);
        //useFrame((state, delta) => {
        //    ((active) ? mesh.current.rotation.y += delta : mesh.current.rotation.y -= delta);
        //});
        useFrame((state, delta) => {
            if (active) {
                mesh.current.position.x += delta;
            }
            if (mesh.current.position.x > 25) {
                mesh.current.position.x = -8;
            }

            if (active) {
                mixer.update(delta);
            }
        });
        const { nodes, animations } = useGLTF("./horse.glb");
        let mixer = new AnimationMixer(nodes.Scene);

        animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
        });

        console.log(animations);

        // Extract animation actions
        const ref = useRef();

        const toggleHorseActive = () => {
            setActive(!active);
        }

        return (
            <group ref={ref} {...props} dispose={null}>
                <group>
                    <primitive ref={mesh} object={nodes.Scene} dispose={null} onClick={toggleHorseActive} rotation={[0, 90, 0]} />
                </group>
            </group>
        )
    };

    return (
        <div className="items-center border w-screen h-lvh">
            <div className="">(work in progress)</div>
            <div id="hiddenDiv" className="invisible">Hello, World!</div>
            <div className="flex w-full h-full">
                <Canvas>
                    <ambientLight intensity={Math.PI / 4} />
                    {/*<spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />*/}
                    <pointLight position={[0, 4, 5]} decay={1} intensity={Math.PI * 2} />
                    <Horse scale={0.5} position={[-6, -1.5, 0]} />
                    <GroundPlane scale={8} rotation={[Math.PI / 2.4, 0, 0]} position={[0, -1.42, 0]} />

                    <TestCube scale={0.2} position={[0, 0.5, 0]} />
                    {<MyAnimatedBox scale={0.25} position={[-1.0, 1, 0.0]} />}

                    {<Button3D scale={0.25} position={[-3.0, 1.6, 0]}
                        onClick={(event) => { console.log("Hello World should appear"); document.getElementById('hiddenDiv').style.visibility = 'visible'; setHideMenu(true); } }
                        text={'Option 0'} />}
                    {<Button3D scale={0.25} position={[-3.0, 1.2, 0]} text={'Option 1'} />}
                    {<Button3D scale={0.25} position={[-3.0, 0.8, 0]} text={'Option 2'} />}
                    {<Button3D scale={0.25} position={[-3.0, 0.4, 0]} text={'Option 3'} />}
                    {<Button3D scale={0.25} position={[-3.0, 0, 0]} text={'Option 4'} /> }
                </Canvas>
            </div>
        </div>
    );
}

export default Art;
