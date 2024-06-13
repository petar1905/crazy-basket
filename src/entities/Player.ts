import { Game } from "../scenes/Game";
import { Ball } from "./Ball";

export class Player extends Phaser.Physics.Arcade.Sprite {
    private up: Phaser.Input.Keyboard.Key;
    private left: Phaser.Input.Keyboard.Key;
    private right: Phaser.Input.Keyboard.Key;
    private shoot: Phaser.Input.Keyboard.Key;
    private keyboard: Phaser.Input.Keyboard.KeyboardPlugin;
    private static velocity: number = 300;
    private emitter: Phaser.Events.EventEmitter;

    constructor(scene: Game, x: number, y: number, flipX: boolean, usesCursorKeys: boolean) {
        super(scene, x, y, "player");
        this.setFlipX(flipX);
        if (scene.input.keyboard != null) {
            this.keyboard = scene.input.keyboard;
        }
        this.setScale(0.25);

        if (usesCursorKeys) {
            this.up = this.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
            this.left = this.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
            this.right = this.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
            this.shoot = this.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
        } else {
            this.up = this.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.left = this.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            this.right = this.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
            this.shoot = this.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)
        }

        //this.anims = new Phaser.Animations.AnimationState(this);
        //this.emitter = emitter;
    }

    update() {
        this.checkInput();
    }

    private jump()
    {
        this.setVelocityY(-(Player.velocity));
    }

    private walkLeft() 
    {
        const ball: boolean = this.getData("ball");
        this.setVelocityX(-(Player.velocity));

        if (ball) {
            this.setFrame(3);
        } else {
            this.setFrame(2);
        }
    }

    private walkRight() 
    {
        const ball: boolean = this.getData("ball");
        this.setVelocityX(Player.velocity);

        if (ball) {
            this.setFrame(3);
        } else {
            this.setFrame(2);
        }    
    }

    private makeIdle()
    {
        const ball: boolean = this.getData("ball");
        this.setVelocityX(0);

        if (ball) {
            this.setFrame(1);
        } else {
            this.setFrame(0);
        }
    }

    public checkInput()
    {
        if (this.keyboard.checkDown(this.up, 5000) && this.body?.velocity.y == 0) {
            this.jump();
        } else if (this.keyboard.checkDown(this.left)) {
            this.walkLeft();
            this.setFlipX(true);
        } else if (this.keyboard.checkDown(this.right)) {
            this.walkRight();
            this.setFlipX(false);
        } else {
            this.makeIdle();
        }

        if (this.keyboard.checkDown(this.shoot)) {
            this.shootBall();
        } 
    }

    public shootBall()
    {
        const ball: boolean = this.getData("ball");
        if (ball) {
            this.setData("ball", false);

            const offsetX = 150;
            const offsetY = 100;
            const ballX = !this.flipX ? this.x+offsetX : this.x-offsetX;
            const ballY = this.y-offsetY;
            const velocityX = this.body?.velocity.x;
            
            this.emitter.emit("createBall", ballX, ballY, velocityX, this.flipX);
        }
    }

    public grabBall()
    {
        this.setData("ball", true);
    }

    public static getDefaultVelocity()
    {
        return Player.velocity;
    }

    public setEmitter(emitter: Phaser.Events.EventEmitter)
    {
        this.emitter = emitter;
    }

}
