import './style.css'
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import * as dat from 'dat.gui'
import * as CANNON from 'cannon-es'
import cannonDebugger from 'cannon-es-debugger'

const canvas = document.querySelector('.webgl')

class NewScene{
    constructor(){
        this._Init()
    }
    
    _Init(){
        this.scene = new THREE.Scene()
        this.clock = new THREE.Clock()
        this.mouse = new THREE.Vector2()
        this.oldElapsedTime = 0;
        this.GUI()
        this.InitGameLogic()
        this.InitPhysics()
        this.InitEnv()
        this.InitPlatform()
        this.InitEnvPhysics()
        this.InitStarterObjects()
        this.InitGamePieces()
        this.InitFontLoader()
        this.InitRaycaster()
        //this.InitCannonDebugger()
        this.InitCamera()
        this.InitLights()
        this.InitRenderer()
        this.InitControls()
        this.Update()
        this.Game()
        window.addEventListener('resize', () => {
            this.Resize()
        })
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = event.clientX / window.innerWidth * 2 - 1
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
        })
        window.addEventListener('touchstart', (event) => {
            event.preventDefault()
            this.mouse.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1
            this.mouse.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1
            this.Game()
        },
        {
            passive: false
        })

        window.addEventListener('click', () => {
            this.Game()
        })
    }

    

    GUI(){
        this.gui = new dat.GUI({ width: 300})
        this.debugObject = {}
    }

    InitGameLogic(){
        this.players = ['X', 'O']
        this.currentTurn = this.players[Math.floor(Math.random() * this.players.length)]
        console.log(this.currentTurn)
        this.array = [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ]
        this.winner = ''

        this.checkWinner = () => {
            let one = this.array[0][0]
            let two = this.array[0][1]
            let three = this.array[0][2]
            let four = this.array[1][0]
            let five = this.array[1][1]
            let six = this.array[1][2]
            let seven = this.array[2][0]
            let eight = this.array[2][1]
            let nine = this.array[2][2]

            if (one !== "" || two !== "" || three !== "" || four !== "" || five !== "" || six !== "" || seven !== "" || eight !== "" || nine !== "" && this.winner!== 'O' && this.winner!=='X'){
                if (one === two && two === three && one === three){
                    console.log('winner is ' + one)
                    this.winner = one
                } else if (one === four && four === seven && one === seven){
                    console.log('winner is ' + one)
                    this.winner = one
                } else if (one === five && five === nine && one === nine){
                    console.log('winner is ' + one)
                    this.winner = one
                } else if (five === four && four === six && six === five){
                    console.log('winner is ' + four)
                    this.winner = four
                } else if (seven === eight && seven === nine && eight === nine){
                    console.log('winner is ' + seven)
                    this.winner = seven
                } else if (two === five && five === eight && two === eight){
                    console.log('winner is ' + two)
                    this.winner = two
                } else if (three === six && three === nine && six === nine){
                    console.log('winner is ' + three)
                    this.winner = three
                } else if (three === five && five === seven && three === seven){
                    console.log('winner is ' + three)
                    this.winner = three
                } 
            }
        }
    }

    InitPhysics(){
        this.world = new CANNON.World()
        this.world.gravity.set(0, -9.82, 0)
        this.world.broadphase = new CANNON.SAPBroadphase(this.world)
        this.world.allowSleep = true
        this.defaultMaterial = new CANNON.Material('default')
        this.defaultContactMaterial = new CANNON.ContactMaterial(
            this.defaultMaterial,
            this.defaultMaterial,
            {
                friction: 0.1,
                restitution: 0.8
            }
        )
        this.world.addContactMaterial(this.defaultContactMaterial)
        this.world.defaultContactMaterial = this.defaultContactMaterial
    }


    InitRaycaster(){
        this.raycaster = new THREE.Raycaster()
        this.mobileRaycaster = new THREE.Raycaster()
        this.currentIntersect = null

        //raycaster boxes
        this.raycasterBoxGeometry = new THREE.BoxGeometry(3, 2, 3)
        this.raycasterBoxMaterial = new THREE.MeshStandardMaterial({
            visible: false
        })
        this.boxTopLeft = new THREE.Mesh(this.raycasterBoxGeometry, this.raycasterBoxMaterial)
        this.boxTopMid = new THREE.Mesh(this.raycasterBoxGeometry, this.raycasterBoxMaterial)
        this.boxTopRight = new THREE.Mesh(this.raycasterBoxGeometry, this.raycasterBoxMaterial)
        this.boxMidLeft = new THREE.Mesh(this.raycasterBoxGeometry, this.raycasterBoxMaterial)
        this.boxMidMid = new THREE.Mesh(this.raycasterBoxGeometry, this.raycasterBoxMaterial)
        this.boxMidRight = new THREE.Mesh(this.raycasterBoxGeometry, this.raycasterBoxMaterial)
        this.boxBottomLeft = new THREE.Mesh(this.raycasterBoxGeometry, this.raycasterBoxMaterial)
        this.boxBottomMid = new THREE.Mesh(this.raycasterBoxGeometry, this.raycasterBoxMaterial)
        this.boxBottomRight = new THREE.Mesh(this.raycasterBoxGeometry, this.raycasterBoxMaterial)

        this.scene.add(this.boxTopLeft, this.boxTopMid, this.boxTopRight, this.boxMidLeft, this.boxMidMid, this.boxMidRight, this.boxBottomLeft, this.boxBottomMid, this.boxBottomRight)

        this.boxTopLeft.position.set(-3.25, 1, -3.25)
        this.boxTopMid.position.set(0, 1, -3.25)
        this.boxTopRight.position.set(3.25, 1, -3.25)
        this.boxMidLeft.position.set(-3.25, 1, 0)
        this.boxMidMid.position.set(0, 1, 0)
        this.boxMidRight.position.set(3.25, 1, 0)
        this.boxBottomLeft.position.set(-3.25, 1, 3.25)
        this.boxBottomMid.position.set(0, 1, 3.25)
        this.boxBottomRight.position.set(3.25, 1, 3.25)
    }

    InitEnv(){
        this.planeGeometry = new THREE.PlaneBufferGeometry(50, 50)
        this.planeMaterial = new THREE.MeshStandardMaterial({ color: 0xff6392, side: THREE.DoubleSide })
        this.planeFloor = new THREE.Mesh(this.planeGeometry, this.planeMaterial)
        this.planeRoof = new THREE.Mesh(this.planeGeometry, this.planeMaterial)
        this.planeRightWall = new THREE.Mesh(this.planeGeometry, this.planeMaterial)
        this.planeLeftWall = new THREE.Mesh(this.planeGeometry, this.planeMaterial)
        this.planeBackWall = new THREE.Mesh(this.planeGeometry, this.planeMaterial)
        this.planeFrontWall = new THREE.Mesh(this.planeGeometry, this.planeMaterial)
        this.scene.add(this.planeFloor, this.planeRightWall, this.planeRoof, this.planeLeftWall, this.planeFrontWall, this.planeBackWall)

        this.planeFloor.rotation.x = -Math.PI * 0.5
        this.planeFloor.position.set(0, -25, 0)
        this.planeFloor.receiveShadow = true

        this.planeRoof.rotation.x = Math.PI * 0.5
        this.planeRoof.position.set(0, 25, 0)

        this.planeRightWall.rotation.y = -Math.PI * 0.5
        this.planeRightWall.position.set(25, 0, 0) 
        this.planeRightWall.receiveShadow = true 

        this.planeLeftWall.rotation.y = Math.PI * 0.5
        this.planeLeftWall.position.set(-25, 0,  0)
        this.planeLeftWall.receiveShadow = true

        this.planeBackWall.rotation.z = -Math.PI * 0.5
        this.planeBackWall.position.set(0, 0, -25)
        this.planeBackWall.receiveShadow = true

        this.planeFrontWall.position.set(0, 0, 25)
        this.planeFrontWall.receiveShadow = true
    }

    InitPlatform(){
        //platform tic tac toe
        this.platformGeometry = new THREE.BoxGeometry(12, 12, 0.5)
        this.platformMaterial = new THREE.MeshStandardMaterial({ color: 0x5aa9e6 })
        this.platform = new THREE.Mesh(this.platformGeometry, this.platformMaterial)
        this.scene.add(this.platform)
        this.platform.castShadow = true
        this.platform.receiveShadow = true
        this.platform.rotation.x = -Math.PI * 0.5

        //grid Tic tac toe
        this.gridGeometry = new THREE.BoxGeometry(0.25, 2, 10)
        this.gridMaterial = new THREE.MeshStandardMaterial({ color: 0x5aa9e6 })
        this.verticalLeft = new THREE.Mesh(this.gridGeometry, this.gridMaterial)
        this.verticalRight = new THREE.Mesh(this.gridGeometry, this.gridMaterial)
        this.horizontalBack = new THREE.Mesh(this.gridGeometry, this.gridMaterial)
        this.horizontalFront = new THREE.Mesh(this.gridGeometry, this.gridMaterial)

        this.scene.add(this.verticalLeft, this.verticalRight, this.horizontalBack, this.horizontalFront)

        this.verticalLeft.position.set(-1.5, 1, 0)
        this.verticalLeft.castShadow = true

        this.verticalRight.position.set(1.5, 1, 0)
        this.verticalRight.castShadow = true

        this.horizontalBack.rotation.y = -Math.PI * 0.5
        this.horizontalBack.position.set(0, 1, -1.5)
        this.horizontalBack.castShadow = true

        this.horizontalFront.rotation.y = -Math.PI * 0.5
        this.horizontalFront.position.set(0, 1, 1.5)
        this.horizontalFront.castShadow = true
    }

    InitEnvPhysics(){
        this.floorBody = new CANNON.Body({
            mass: 0,
            material: this.defaultMaterial
        })
        this.world.addBody(this.floorBody)
        this.floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
        this.floorBody.addShape(new CANNON.Box(new CANNON.Vec3(25, 25, 0.1)), new CANNON.Vec3(0, 0, -25))

        this.backFrontWallBody = new CANNON.Body({
            mass: 0,
            material: this.defaultMaterial
        })
        this.world.addBody(this.backFrontWallBody)
        this.backFrontWallBody.addShape(new CANNON.Box(new CANNON.Vec3(25, 25, 0.1)), new CANNON.Vec3(0, 0, -25))
        this.backFrontWallBody.addShape(new CANNON.Box(new CANNON.Vec3(25, 25, 0.1)), new CANNON.Vec3(0, 0, 25))

        this.leftRightwallBody = new CANNON.Body({
            mass: 0,
            material: this.defaultMaterial
        })
        this.world.addBody(this.leftRightwallBody)
        this.leftRightwallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, -1, 0), Math.PI * 0.5)
        this.leftRightwallBody.addShape(new CANNON.Box(new CANNON.Vec3(25, 25, 0.1)), new CANNON.Vec3(0, 0, 25))
        this.leftRightwallBody.addShape(new CANNON.Box(new CANNON.Vec3(25, 25, 0.1)), new CANNON.Vec3(0, 0, -25))

        //Cannon platform
        this.platformShape = new CANNON.Box(new CANNON.Vec3(6, 6, 0.25))
        this.platformBody = new CANNON.Body({
            mass: 0,
            shape: this.platformShape,
            material: this.defaultMaterial
        })
        this.world.addBody(this.platformBody)
        this.platformBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)

        this.gridBody = new CANNON.Body({
            mass: 0,
            material: this.defaultMaterial
        })

        this.gridBody.addShape(new CANNON.Box(new CANNON.Vec3(0.125, 1, 5)), new CANNON.Vec3(-1.5, 1, 0))
        this.gridBody.addShape(new CANNON.Box(new CANNON.Vec3(0.125, 1, 5)), new CANNON.Vec3(1.5, 1, 0))
        this.gridBody.addShape(new CANNON.Box(new CANNON.Vec3(5, 1, 0.125)), new CANNON.Vec3(0, 1, -1.5))
        this.gridBody.addShape(new CANNON.Box(new CANNON.Vec3(5, 1, 0.125)), new CANNON.Vec3(0, 1, 1.5))
        this.gridBody.addShape(new CANNON.Box(new CANNON.Vec3(5, 2, 0.125)), new CANNON.Vec3(0, 1, -6))
        this.gridBody.addShape(new CANNON.Box(new CANNON.Vec3(5, 2, 0.125)), new CANNON.Vec3(0, 1, 6))
        this.gridBody.addShape(new CANNON.Box(new CANNON.Vec3(0.125, 2, 5)), new CANNON.Vec3(-6, 1, 0))
        this.gridBody.addShape(new CANNON.Box(new CANNON.Vec3(0.125, 2, 5)), new CANNON.Vec3(6, 1, 0))
        this.world.addBody(this.gridBody)
    }

    InitStarterObjects(){
        this.oUpdate = []
        this.xUpdate = []

        this.torusGeometry = new THREE.TorusBufferGeometry(1, 0.5, 32, 32)
        this.torusMaterial = new THREE.MeshStandardMaterial({color: 0x7fc8f8})
        this.verticalRectangleShape = new CANNON.Box(new CANNON.Vec3(0.5, 1.5, 0.5))
        this.horizontalRectangleShape = new CANNON.Box(new CANNON.Vec3(1.5, 0.5, 0.5))
        this.createO = () => {
            for (let i = 0; i<= 10; i++){
                //Three.js Torus
                this.torus = new THREE.Mesh(this.torusGeometry, this.torusMaterial)
                this.scene.add(this.torus)
                this.torus.castShadow = true
                this.torus.position.x = (Math.random() -0.5) * 4
                this.torus.position.z = (Math.random() -0.5) * 4
                this.torus.position.y = -5
                
                //Cannon.js Torusthis.
                this.torusBody = new CANNON.Body({
                    mass: 1,
                    material: this.defaultMaterial
                })
                this.torusBody.addShape(this.verticalRectangleShape)
                this.torusBody.addShape(this.horizontalRectangleShape)
                this.torusBody.addShape(new CANNON.Sphere(0.6), new CANNON.Vec3(0.75, 0.75, 0))
                this.torusBody.addShape(new CANNON.Sphere(0.6), new CANNON.Vec3(-0.75, 0.75, 0))
                this.torusBody.addShape(new CANNON.Sphere(0.6), new CANNON.Vec3(0.75, -0.75, 0))
                this.torusBody.addShape(new CANNON.Sphere(0.6), new CANNON.Vec3(-0.75, -0.75, 0))
        
                this.torusBody.position.x = this.torus.position.x
                this.torusBody.position.y = this.torus.position.y
                this.torusBody.position.z = this.torus.position.z
                this.world.addBody(this.torusBody)
        
                this.oUpdate.push({
                    mesh: this.torus,
                    body: this.torusBody
                })
            }     
        }

        this.xGeometry = new THREE.BoxGeometry(4, 1, 1)
        this.xMaterial = new THREE.MeshStandardMaterial({color: 0x00ffff})
        this.xShape = new CANNON.Box(new CANNON.Vec3(1.8, 1.8, 0.5))
        this.createX = () => {
            for (let i = 0; i <= 10; i++){
                this.xGroup = new THREE.Group()
                this.xLeft = new THREE.Mesh(this.xGeometry, this.xMaterial)
                this.xRight = new THREE.Mesh(this.xGeometry, this.xMaterial)
                this.xGroup.position.x = (Math.random() - 0.5) * 4
                this.xGroup.position.z = (Math.random() - 0.5) * 4
                this.xGroup.position.y = -5

                this.xLeft.castShadow = true
                this.xRight.castShadow = true
                this.xLeft.rotation.z = -Math.PI * 0.25
                this.xRight.rotation.z = Math.PI * 0.25
                this.xGroup.add(this.xLeft)
                this.xGroup.add(this.xRight)
                this.scene.add(this.xGroup)

                //physics
                this.xBody = new CANNON.Body({
                    mass: 1, 
                    material: this.defaultMaterial
                })
                this.xBody.position.x = this.xGroup.position.x
                this.xBody.position.y = this.xGroup.position.y
                this.xBody.position.z = this.xGroup.position.z
                this.xBody.addShape(this.xShape)
                this.world.addBody(this.xBody)

                this.oUpdate.push({
                    mesh: this.xGroup,
                    body: this.xBody
                })
            }
        }
        this.createO()
        this.createX()
    }

    InitGamePieces(){
        //three.js and cannon-es O game piece
        this.torusSmallGeometry = new THREE.TorusGeometry(0.5, 0.25, 32, 32)
        this.verticalSmallRectangleShape = new CANNON.Box(new CANNON.Vec3(0.25, 0.75, 0.25))
        this.horizontalSmallRectangleShape = new CANNON.Box(new CANNON.Vec3(0.75, 0.25, 0.25))
        this.xSmallGeometry = new THREE.BoxGeometry(2, 0.5, 0.5)
        this.xSmallMaterial = new THREE.MeshStandardMaterial({color: 0x00ffff})
        this.xSmallShape = new CANNON.Box(new CANNON.Vec3(0.9, 0.9, 0.25))
        this.genSmallO = (x, y, z) => {
            this.torus = new THREE.Mesh(this.torusSmallGeometry, this.torusMaterial)
            this.scene.add(this.torus)
            this.torus.castShadow = true
            this.torus.position.x = x
            this.torus.position.y = y
            this.torus.position.z = z

            //cannon-es
            this.torusBody = new CANNON.Body({
                mass: 1,
                material: this.defaultMaterial
            })
            this.torusBody.addShape(this.verticalSmallRectangleShape)
            this.torusBody.addShape(this.horizontalSmallRectangleShape)
            this.torusBody.addShape(new CANNON.Sphere(0.3), new CANNON.Vec3(0.325, 0.325, 0))
            this.torusBody.addShape(new CANNON.Sphere(0.3), new CANNON.Vec3(-0.325, 0.325, 0))
            this.torusBody.addShape(new CANNON.Sphere(0.3), new CANNON.Vec3(0.325, -0.325, 0))
            this.torusBody.addShape(new CANNON.Sphere(0.3), new CANNON.Vec3(-0.325, -0.325, 0))

            this.torusBody.position.x = this.torus.position.x
            this.torusBody.position.y = this.torus.position.y
            this.torusBody.position.z = this.torus.position.z
            
            this.world.addBody(this.torusBody)

            this.oUpdate.push({
                mesh: this.torus,
                body: this.torusBody
            })
        }
        this.genSmallX = (x, y, z) => {
            this.xGroup = new THREE.Group()
            this.xLeft = new THREE.Mesh(this.xSmallGeometry, this.xSmallMaterial)
            this.xRight = new THREE.Mesh(this.xSmallGeometry, this.xSmallMaterial)
            this.xGroup.position.x = x
            this.xGroup.position.z = z
            this.xGroup.position.y = y
            
            this.xLeft.castShadow = true
            this.xRight.castShadow = true
            this.xLeft.rotation.z = -Math.PI * 0.25
            this.xRight.rotation.z = Math.PI * 0.25
            this.xGroup.add(this.xLeft)
            this.xGroup.add(this.xRight)
            this.scene.add(this.xGroup)
            //Cannon.js X Body
            
            this.xBody = new CANNON.Body({
                mass: 1,
                material: this.defaultMaterial
            })
            this.xBody.position.x = this.xGroup.position.x
            this.xBody.position.y = this.xGroup.position.y
            this.xBody.position.z = this.xGroup.position.z
            
            this.xBody.addShape(this.xSmallShape)
            this.world.addBody(this.xBody)
            
            this.xUpdate.push({
                mesh: this.xGroup,
                body: this.xBody
            })
        }
    }

    InitFontLoader(){
        this.fontLoader = new THREE.FontLoader()
        this.fontLoader.load(
            'https://raw.githubusercontent.com/nargaw/3D-Tic-Tac-Toe/master/static/fonts/Artista%202.0/Arista%202.0_Regular.typeface.json',
            (font) => {
                this.largeSize = 8
                this.smallSize = 3
                this.midSize = 5
                this.winnerSize = 20
                this.fontGeometry = {
                    font: font,
                    size: 1,
                    height: this.midSize,
                    curveSegments: 4,
                    bevelEnabled: true,
                    bevelThickness: 0.05,
                    bevelSize: 0.02,
                    bevelOffset: 0,
                    bevelSegments: 4
                }
                this.textMaterial = new THREE.MeshStandardMaterial({color: 0x00ffff})
                
                //backwall text
                this.textBackWallGeometry = new THREE.TextGeometry(
                    'Twitter:\n@nate_dev_', 
                    this.fontGeometry
                )
                this.textBackWallGeometry.scale(3, 3, 1)
                this.textBackWallGeometry.computeBoundingBox()
                this.textBackWallGeometry.center()
                this.textBackWall = new THREE.Mesh(this.textBackWallGeometry, this.textMaterial)
                this.scene.add(this.textBackWall)
                this.textBackWall.position.set(0, 5, 25)
                this.textBackWall.rotation.y = -Math.PI
                this.textBackWall.castShadow = true

                //frontwalltext
                this.textFrontWallGeometry = new THREE.TextGeometry(
                    '3D\nTIC\nTAC\nTOE',
                    this.fontGeometry
                )
                this.textFrontWallGeometry.scale(6, 6, 1)
                this.textFrontWallGeometry.computeBoundingBox()
                this.textFrontWallGeometry.center()
                this.textFrontWall = new THREE.Mesh(this.textFrontWallGeometry, this.textMaterial)
                this.scene.add(this.textFrontWall)
                this.textFrontWall.position.set(0, 2, -25)
                this.textFrontWall.castShadow = true

                //Rightwalltext
                this.textRightWallGeometry = new THREE.TextGeometry(
                    'This\nproject\nwas\nmade\nusing\nThree.js',
                    this.fontGeometry
                )
                this.textRightWallGeometry.scale(3, 3, 0.5)
                this.textRightWallGeometry.computeBoundingBox()
                this.textRightWallGeometry.center()
                this.textRightWall = new THREE.Mesh(this.textRightWallGeometry, this.textMaterial)
                this.scene.add(this.textRightWall)
                this.textRightWall.position.set(25,0,0)
                this.textRightWall.rotation.y = -Math.PI * 0.5
                this.textRightWall.castShadow = true

                //leftwalltext
                this.textLeftWallGeometry = new THREE.TextGeometry(
                    'The Winner is:',
                    this.fontGeometry
                )
                this.textLeftWallGeometry.scale(3, 3, 1)
                this.textLeftWallGeometry.computeBoundingBox()
                this.textLeftWallGeometry.center()
                this.textLeftWall = new THREE.Mesh(this.textLeftWallGeometry, this.textMaterial)
                this.scene.add(this.textLeftWall)
                this.textLeftWall.position.set(-25,15,0)
                this.textLeftWall.rotation.y = Math.PI * 0.5
                this.textLeftWall.castShadow = true

                this.displayWinner = () => {
                    if (this.winner === 'O' || this.winner === 'X'){
                        this.winnerGeometry = new THREE.TextGeometry(
                            this.winner, {
                                font: font,
                                size: 20,
                                height: 5,
                                curveSegments: 4,
                                bevelEnabled: true,
                                bevelThickness: 0.05,
                                bevelSize: 0.02,
                                bevelOffset: 0,
                                bevelSegments: 4
                            }
                        )
                        this.winnerGeometry.computeBoundingBox()
                        this.winnerGeometry.center()
                        this.winnerText = new THREE.Mesh(this.winnerGeometry, this.textMaterial)
                        this.scene.add(this.winnerText)
                        this.winnerText.position.set(-25, 0, 0)
                        this.winnerText.rotation.y = Math.PI * 0.5
                        this.winnerText.castShadow = true
                        this.createO()
                        this.createX()
                    }
                }
            }
        )
    }

    Game(){
        if(this.currentIntersect && this.winner !== 'X' && this.winner !== 'O'){
            switch(this.currentIntersect.object){
                case this.boxTopLeft:
                    if (this.array[0][0] !== 'X' && this.array[0][0] !== 'O'){
                        if (this.currentTurn === 'O'){
                            this.genSmallO(-3.25, 6, -3)
                            this.array[0].splice(0, 1, 'O')
                            this.currentTurn = 'X'
                        } else {
                            this.genSmallX(-3.25, 6, -3)
                            this.array[0].splice(0, 1, 'X')
                            this.currentTurn = 'O'
                        }
                    }
                    this.checkWinner()
                    this.displayWinner()
                    break
                
                case this.boxTopMid:
                    if (this.array[0][1] !== 'X' && this.array[0][1] !== 'O'){
                        if (this.currentTurn === 'O'){
                            this.genSmallO(0, 6, -3)
                            this.array[0].splice(1, 1, 'O')
                            this.currentTurn = 'X'
                        } else {
                            this.genSmallX(0, 6, -3)
                            this.array[0].splice(1, 1, 'X')
                            this.currentTurn = 'O'
                        }
                    }
                    this.checkWinner()
                    this.displayWinner()
                    break

                case this.boxTopRight:
                    if (this.array[0][2] !== 'X' && this.array[0][2] !== 'O'){
                        if (this.currentTurn === 'O'){
                            this.genSmallO(3.25, 6, -3)
                            this.array[0].splice(2, 1, 'O')
                            this.currentTurn = 'X'
                        } else {
                            this.genSmallX(3.25, 6, -3)
                            this.array[0].splice(2, 1, 'X')
                            this.currentTurn = 'O'
                        }
                    }
                    this.checkWinner()
                    this.displayWinner()
                    break

                case this.boxMidLeft:
                    if (this.array[1][0] !== 'X' && this.array[1][0] !== 'O'){
                        if (this.currentTurn === 'O'){
                            this.genSmallO(-3.25, 6, 0)
                            this.array[1].splice(0, 1, 'O')
                            this.currentTurn = 'X'
                        } else {
                            this.genSmallX(-3.25, 6, 0)
                            this.array[1].splice(0, 1, 'X')
                            this.currentTurn = 'O'
                        }
                    }
                    this.checkWinner()
                    this.displayWinner()
                    break

                case this.boxMidMid:
                    if (this.array[1][1] !== 'X' && this.array[1][1] !== 'O'){
                        if (this.currentTurn === 'O'){
                            this.genSmallO(0, 6, 0)
                            this.array[1].splice(1, 1, 'O')
                            this.currentTurn = 'X'
                        } else {
                            this.genSmallX(0, 6, 0)
                            this.array[1].splice(1, 1, 'X')
                            this.currentTurn = 'O'
                        }
                    }
                    this.checkWinner()
                    this.displayWinner()
                    break

                case this.boxMidRight:
                    if (this.array[1][2] !== 'X' && this.array[1][2] !== 'O'){
                        if (this.currentTurn === 'O'){
                            this.genSmallO(3.25, 6, 0)
                            this.array[1].splice(2, 1, 'O')
                            this.currentTurn = 'X'
                        } else {
                            this.genSmallX(3.25, 6, 0)
                            this.array[1].splice(2, 1, 'X')
                            this.currentTurn = 'O'
                        }
                    }
                    this.checkWinner()
                    this.displayWinner()
                    break

                case this.boxBottomLeft:
                    if (this.array[2][0] !== 'X' && this.array[2][0] !== 'O'){
                        if (this.currentTurn === 'O'){
                            this.genSmallO(-3.25, 6, 3)
                            this.array[2].splice(0, 1, 'O')
                            this.currentTurn = 'X'
                        } else {
                            this.genSmallX(-3.25, 6, 3)
                            this.array[2].splice(0, 1, 'X')
                            this.currentTurn = 'O'
                        }
                    }
                    this.checkWinner()
                    this.displayWinner()
                    break

                case this.boxBottomMid:
                    if (this.array[2][1] !== 'X' && this.array[2][1] !== 'O'){
                        if (this.currentTurn === 'O'){
                            this.genSmallO(0, 6, 3)
                            this.array[2].splice(1, 1, 'O')
                            this.currentTurn = 'X'
                        } else {
                            this.genSmallX(0, 6, 3)
                            this.array[2].splice(1, 1, 'X')
                            this.currentTurn = 'O'
                        }
                    }
                    this.checkWinner()
                    this.displayWinner()
                    break

                case this.boxBottomRight:
                    if (this.array[2][2] !== 'X' && this.array[2][2] !== 'O'){
                        if (this.currentTurn === 'O'){
                            this.genSmallO(3.25, 6, 3)
                            this.array[2].splice(2, 1, 'O')
                            this.currentTurn = 'X'
                        } else {
                            this.genSmallX(3.25, 6, 3)
                            this.array[2].splice(2, 1, 'X')
                            this.currentTurn = 'O'
                        }
                    }
                    this.checkWinner()
                    this.displayWinner()
                    break
            }
        }
    }

    InitCannonDebugger(){
        cannonDebugger(this.scene, this.world.bodies, {
            color: 0x00ff00,
            autoUpdate: true
        })
    }

    InitCamera(){
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,0.1, 1000)
        this.camera.position.set(0, 10, 20)
        this.scene.add(this.camera)
    }

    InitLights(){
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
        this.scene.add(this.ambientLight)

        this.pointLightBack = new THREE.PointLight(0xffffff, 0.3, 100, 0.1)
        this.pointLightLeft = new THREE.PointLight(0xffffff, 0.2, 100, 0.1)
        this.pointLightRight = new THREE.PointLight(0xffffff, 0.2, 100, 0.1)
        this.pointLightBack.position.set(0, 20, 0)
        this.pointLightBack.castShadow = true
        this.pointLightLeft.position.set(-10, 10, 0)
        this.pointLightRight.position.set(20, 10, 0)
        this.scene.add(this.pointLightBack, this.pointLightLeft, this.pointLightRight)
    }

    InitRenderer(){
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
        })
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.render(this.scene, this.camera)
    }

    InitControls(){
        this.controls = new OrbitControls(this.camera, canvas)
        this.controls.enableDamping = true
        this.controls.enablePan = false
        this.controls.enableZoom = false
    }

    Resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    }

    Update(){
        
        requestAnimationFrame(() => {  
            this.elapsedTime = this.clock.getElapsedTime()
            this.deltaTime = this.elapsedTime - this.oldElapsedTime
            this.oldElapsedTime = this.elapsedTime
            
            this.world.step(1/60, this.deltaTime, 3)

            for(this.object of this.oUpdate){
                this.object.mesh.position.copy(this.object.body.position)
                this.object.mesh.quaternion.copy(this.object.body.quaternion)
            }

            for(this.object of this.xUpdate){
                this.object.mesh.position.copy(this.object.body.position)
                this.object.mesh.quaternion.copy(this.object.body.quaternion)
            }

            //test raycaster
            this.raycaster.setFromCamera(this.mouse, this.camera)
            //this.mobileRaycaster.setFromCamera()
            let objectsToTest = [
                this.boxTopLeft, this.boxTopMid, this.boxTopRight, this.boxMidLeft, this.boxMidMid, this.boxMidRight, this.boxBottomLeft, this.boxBottomMid, this.boxBottomRight
            ]
            this.intersects = this.raycaster.intersectObjects(objectsToTest)
            if(this.intersects.length){
                if(!this.currentIntersect){
                    //console.log('mouse enter')
                }
                this.currentIntersect = this.intersects[0]
            } else {
                if(this.currentIntersect){
                    //console.log('mouse leave')
                    this.currentIntersect = null
                }
            }

            this.renderer.render(this.scene, this.camera)
            this.controls.update()
            this.Update()
        })  
    }
}

let _APP = null

window.addEventListener('DOMContentLoaded', () => {
    _APP = new NewScene()
})