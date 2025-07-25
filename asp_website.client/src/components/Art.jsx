import React, { useRef, useState, useMemo, useReducer } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { useGLTF, GradientTexture, Sky, OrbitControls, Clouds, Cloud, Stars } from '@react-three/drei';
import { AnimationMixer, Color, BackSide, MathUtils, MeshBasicMaterial, Vector3 } from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

import almendra from '../fonts/Almendra SC_Regular.json';
import vertShader from '../shaders/waveTestVertexShader.glsl';
import stillWaveVertShader from '../shaders/stillWaveVertexShader.glsl';
import fragShader from '../shaders/waveTestFragmentShader.glsl';
import sandFragShader from '../shaders/monochromeFragmentShader.glsl';
import blobFragmentShader from '../shaders/blobFragmentShader.glsl';
import blobVertexShader from '../shaders/blobVertexShader.glsl';


extend({ TextGeometry });

function Art(props) {

    const font = new FontLoader().parse(almendra);
    const [hideMenu, setHideMenu] = useState(false);
    const [clockButton, setClockButton] = useState({ text: 'Stop Clock', textOffset: 0.3, age: 30 });
    const isClockRunning = useRef(true);
    const savedHour = useRef(4);
    const savedMinute = useRef(0);
    // We have one light:
    const ambientIntensity = useRef(Math.PI / 4);
    const pointIntensity = useRef(Math.PI * 2);
    const lightColor = useRef([1.0, 1.0, 1.0]);


    const handleSubmit = (event) => {
        event.preventDefault();
    }

    const pauseClicked = (event) => {
        if (isClockRunning.current) {
            const pauseButton = document.getElementById("pauseButton");
            pauseButton.innerText = "UNPAUSE";
        } else {
            const pauseButton = document.getElementById("pauseButton");
            pauseButton.innerText = "PAUSE";
        }

        isClockRunning.current = !isClockRunning.current;
    }

    function SetUiTime(hour, minute) {
        const currentHourInput = document.getElementById("currentHourInput");
        currentHourInput.value = "" + hour;

        const currentMinuteInput = document.getElementById("currentMinuteInput");
        currentMinuteInput.value = "" + Math.trunc(minute * 10) + Math.trunc(minute * 100 % 10);
    }

    const changeTime = () => {
        // TODO
        const currentHourInput = document.getElementById("currentHourInput");
        const currentMinuteInput = document.getElementById("currentMinuteInput");
    }

    function GroundPlane(props) {
        const mesh = useRef();

        // TODO: Only pass light color, not sand color
        const uniforms = useMemo(
            () => ({

                u_ambientLightIntensity: {
                    value: ambientIntensity,
                },
                u_pointLightIntensity: {
                    value: pointIntensity,
                },
                u_lightColor: {
                    value: new Vector3(lightColor.current[0], lightColor.current[1], lightColor.current[2]),
                },
                u_sandColor: {
                    value: new Vector3(0.93, 0.79, 0.69),
                },
            }), []
        );

        useFrame(({ clock }) => {
            mesh.current.material.uniforms.u_sandColor.value = new Vector3(0.93, 0.79, 0.69);
            mesh.current.material.uniforms.u_lightColor.value = new Vector3(lightColor.current[0], lightColor.current[1], lightColor.current[2]);
        });

        return (
            <mesh {...props} ref={mesh}>
                <planeGeometry args={[2.5, 1, 8, 8]} />
                <meshBasicMaterial color={[0.93, 0.79, 0.69]} />
                <shaderMaterial
                    vertexShader={stillWaveVertShader}
                    fragmentShader={sandFragShader}
                    uniforms={uniforms}
                    side={BackSide}
                    //wireframe
                />
            </mesh>
        )
    }

    function MovingPlane(props) {
        const mesh = useRef();
        const hover = useRef(false);

        const uniforms = useMemo(
            () => ({
                u_time: {
                    value: 0.0,
                },
                u_hover: {
                    value: false,
                },
            }), []
        );

        useFrame(({ clock }) => {
            mesh.current.material.uniforms.u_time.value = clock.getElapsedTime();
            mesh.current.material.uniforms.u_hover.value = hover.current;
        })

        return (
            <mesh
                ref={mesh}
                position={[0, 0, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={3.5}
                onPointerEnter={() => hover.current = true}
                onPointerLeave={() => hover.current = false }
                >
                <planeGeometry args={[1, 1, 32, 32]} />
                <shaderMaterial
                    fragmentShader={fragShader}
                    vertexShader={vertShader}
                    uniforms={uniforms}
                    wireframe
                />
            </mesh>
        )
    }

    function DayNightSky(props) {
        const mesh = useRef();
        const skyRef = useRef();
        const adjustedSunInclination = useRef(-0.11);
        const [, forceUpdate] = useReducer(x => x + 1, 0);

        // TODO: Call this when we return to normal time
        //const setCurrentTime = (currentHour, currentMinute) => {
        //    const currentTime = currentHour + (currentMinute / 60.0);

        //    adjustedSunInclination.current = (currentTime / 12.0) - 0.55; // in range of (0, 2)
        //}

        useFrame((state, delta) => {
            if (isClockRunning.current) {
                adjustedSunInclination.current += (delta / 20.0);
                forceUpdate();

                // Update global clock and onscreen time
                const currentTimeSpan = document.getElementById("currentTimeSpan");
                const currentTime = ((12 * (0.55 + adjustedSunInclination.current)) % 24);
                savedHour.current = Math.trunc(currentTime);
                savedMinute.current = (currentTime % 1) * (6 / 10);
                currentTimeSpan.innerText = "" + savedHour.current + ":" + Math.trunc(savedMinute.current * 10) + Math.trunc(savedMinute.current * 100 % 10);

                SetUiTime(savedHour.current, savedMinute.current);
            }
        })


        return (
            <mesh ref={mesh}>
                <Sky ref={skyRef} distance={100} inclination={0.55 + adjustedSunInclination.current} azimuth={0.3} rayleigh={1} {...props} />
                <Stars radius={100} depth={50} count={(savedHour.current > 6 && savedHour.current < 18) ? 0 : 5000} factor={4} saturation={0} fade speed={1} />
            </mesh>
        )
    }

    function DayNightLights(props) {
        const mesh = useRef();
        const [, forceUpdate] = useReducer(x => x + 1, 0);

        useFrame((state, delta) => {

            if (savedHour.current > 5 && savedHour.current < 18) { // day
                ambientIntensity.current = Math.PI / 4;
                pointIntensity.current = Math.PI * 2;
                lightColor.current = [1.0, 1.0, 1.0];
                forceUpdate();
            } else { // night
                ambientIntensity.current = Math.PI / 8;
                pointIntensity.current = Math.PI;
                lightColor.current = [0.35, 0.35, 0.67];
                forceUpdate();
            }
        })

        return (
            <mesh {...props} ref={mesh}>
                <ambientLight intensity={ambientIntensity.current} color={lightColor} />
                {/*<spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />*/ }
                <pointLight position={[0, 4, 5]} decay={1} intensity={pointIntensity.current} color={lightColor}  />
            </mesh>
        )
    }

    function AppearingCloud(props) {
        const cloudRef = useRef();
        const currentSize = useRef((props.timeOffset !== undefined) ? props.timeOffset : 0.0);
        const currentSizeDirection = useRef(true);

        // if values aren't set manually, use defaults
        const segments = (props.segments !== undefined) ? props.segments : 40;
        const volume = (props.volume !== undefined) ? props.volume : 15;
        const bounds = (props.bounds !== undefined) ? props.bounds : [15, 2, 2];

        // Make the clouds bigger and smaller over time
        useFrame((state, delta) => {
            if (currentSizeDirection.current === true) {
                currentSize.current += delta;
            } else {
                currentSize.current -= delta;
            }

            if (currentSize.current > 20) {
                currentSize.current = 20;
                currentSizeDirection.current = false;
            }
            if (currentSizeDirection.current === false && currentSize.current < 18) {
                currentSize.current = 18;
                currentSizeDirection.current = true;
            }

            cloudRef.current.scale.x = cloudRef.current.scale.y = cloudRef.current.scale.z = 0.0 + (currentSize.current / 40)

        })

        return (
            <Cloud ref={cloudRef} segments={segments} bounds={bounds} volume={volume} color='lightgray' position={props.position} />
        )
    }

    function AppearingClouds(props) {
        const mesh = useRef();

        return (
            <mesh {...props} ref={mesh}>
                <Clouds material={MeshBasicMaterial}>
                    {/*<AppearingCloud position={[15, 15, -30]} timeOffset={0.5} />*/}
                    <AppearingCloud position={[-15, 26, -35]} />
                    <AppearingCloud position={[-5, 21, -32]} timeOffset={0.3} />
                    <AppearingCloud position={[-11, 20, -31]} timeOffset={0.5} />

                </Clouds>
            </mesh>
        )
    }

    function MyAnimatedBox(props) {
        const myMesh = useRef();
        const [boxMouseHover, setBoxMouseHover] = useState(false);

        useFrame(({ clock }) => {
            if (!boxMouseHover)
                myMesh.current.rotation.x = clock.getElapsedTime(); // what is clock.getElapsedTime()? I'm assuming it gets time since last frame
        })

        return (
            <mesh {...props}
                onPointerEnter={() => setBoxMouseHover(true)} onPointerLeave={() => setBoxMouseHover(false)}
                ref={myMesh}>
                <boxGeometry />
                <meshBasicMaterial color="cornflowerblue" />
            </mesh>
        )
    }

    const Blob = () => {
        const mesh = useRef();
        const hover = useRef(false);

        const uniforms = useMemo(
            () => ({
                u_intensity: {
                    value: 0.3,
                },
                u_time: {
                    value: 0.0,
                },
            }), []
        );

        useFrame(({ clock }) => {
            mesh.current.material.uniforms.u_time.value = 0.4 * clock.getElapsedTime();
                mesh.current.material.uniforms.u_intensity.value = MathUtils.lerp(
                    mesh.current.material.uniforms.u_intensity.value,
                    hover.current ? 0.85 : 0.15,
                    0.02
                );
        })

        return (
            <mesh
                ref={mesh}
                position={[0, 1.5, 0]}
                onPointerOver={() => (hover.current = true)}
                onPointerOut={() => (hover.current = false)}
            >
                <icosahedronGeometry args={[0.5, 20]} />
                <shaderMaterial
                    fragmentShader={blobFragmentShader}
                    vertexShader={blobVertexShader}
                    uniforms={uniforms}
                />

            </mesh>
            );
    }

    function Button3D(props) {
        const mesh = useRef(null);
        //const hover = useRef(false);
        const [hovered, setHover] = useState(false);
        const [active, setActive] = useState(false);

        const makeButtonActive = () => {
            setActive(true);
        }

        // button color: teal by default, purple on mouseover
        return (
            <>
                {/* Draw the button */}
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
                            colors={hovered ? ['#76387b', '#e50cff', '#e50cff', '#76387b'] : ['#24b4c5', '#50d9ff', '#50d9ff', '#24b4c5']}
                            size={1024}
                        />
                    </meshBasicMaterial>
                </mesh>
                
                {/* Add text */}
                <mesh
                    {...props}
                    position={[props.position[0] - props.textOffset, props.position[1] - 0.05, props.position[2]]}
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
        // Spin horse around
        //useFrame((state, delta) => {
        //    ((active) ? mesh.current.rotation.y += delta : mesh.current.rotation.y -= delta);
        //});
        useFrame((state, delta) => {
            if (active && isClockRunning.current) {
                mesh.current.position.x += delta;
            }
            if (mesh.current.position.x > 22) {
                mesh.current.position.x = -5;
            }

            if (active && isClockRunning.current) {
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
                    <primitive ref={mesh} object={nodes.Scene} dispose={null} onClick={toggleHorseActive} rotation={[0, Math.PI / 2, 0]} />
                </group>
            </group>
        )
    };

    return (
        <div class="content content3d">
            <div class="title">3D Graphics</div>
            <div class="form-background">
                <form onSubmit={handleSubmit}>
                    <span className="italic">(work in progress)</span> - <span className="font-semibold">Current Time: </span>
                    <input id="currentHourInput" className="w-5 text-right" value="05" onChange={changeTime} />
                    :
                    <input id="currentMinuteInput" className="w-5 text-right" value="20" onChange={changeTime} />
                    <span className="invisible" id="currentTimeSpan" />
                    <button id="pauseButton" onClick={pauseClicked}>PAUSE</button>
                </form>
            </div>
            <div id="hiddenDiv" className="invisible italic">Hide Menu button was pressed</div>
            <div className="flex w-full h-full">
                <Canvas>
                    <DayNightLights />

                    <DayNightSky />
                    <AppearingClouds />

                    <Horse scale={0.5} position={[-6, -1.45, 0]} />
                    <GroundPlane scale={8} rotation={[Math.PI / 2.1, 0, 0]} position={[0, -1.42, 0]} />

                    <MovingPlane />
                    <OrbitControls />

                    <TestCube scale={0.2} position={[0, 0.5, 0]} />
                    <Blob />
                    {<MyAnimatedBox scale={0.25} position={[-1.0, 1, 0.0]} />}

                    {<Button3D scale={0.25} position={[-3.0, 2.0, 0]}
                        onClick={(event) => { console.log("Hello World should appear"); document.getElementById('hiddenDiv').style.visibility = 'visible'; setHideMenu(true); }}
                        text={'Hide Menu'} textOffset={0.3} />}
                    {<Button3D scale={0.25} position={[-3.0, 1.7, 0]} text={clockButton.text}
                        onClick={(event) => {
                            // TODO: Can I say 'event.preventDefault()' and not force a page refresh here? 
                            if (!isClockRunning.current) {
                                setClockButton({ text: 'Stop Clock', textOffset: 0.3, age: 30 });
                            //    hour = savedHour;
                            //    minute = savedMinute;
                            }
                            else {
                                setClockButton({ text: 'Restart Clock', textOffset: 0.4, age: 30 });
                                //savedHour.current = hour;
                                //savedMinute.current = minute;
                            }
                            isClockRunning.current = !isClockRunning.current;
                        }}
                        textOffset={clockButton.textOffset} />}
                    {<Button3D scale={0.25} position={[-3.0, 1.4, 0]} text={'Option 3'} textOffset={0.23} />}
                </Canvas>
            </div>
        </div>
    );
}

export default Art;
