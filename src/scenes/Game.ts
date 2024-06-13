import { Scene } from 'phaser';
import { Player } from '../entities/Player';
import { Ball } from '../entities/Ball';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    private player1: Player;
    private player2: Player;
    private ball: Ball;
    private score1: number;
    private score2: number;
    private basket1: Phaser.GameObjects.Rectangle;
    private basket2: Phaser.GameObjects.Rectangle;
    private alreadyOverlap: boolean = false;

    constructor ()
    {
        super('Game');
    }

    preload()
    {
        this.load.setPath('assets');
        this.load.spritesheet('player', 'player.png', { frameWidth: 586, frameHeight: 1167 });
        this.load.image('ball', 'ball.png');
    }

    create ()
    {
        this.camera = this.cameras.main;

        this.background = this.add.image(512, 384, 'background');

        this.msg_text = this.add.text(512, 0, `0-0`, {
            fontSize: 60
        }).setOrigin(0.5, 0);

        const playableAreaHeight = this.scale.height*0.8;
        this.physics.world.setBounds(0,0,this.scale.width, playableAreaHeight);

        let ballCreationEmitter = new Phaser.Events.EventEmitter();

        this.player1 = new Player(this, 128, 384, false, false);
        this.player1.setEmitter(ballCreationEmitter);
        this.add.existing(this.player1);
        this.physics.add.existing(this.player1);
        this.player1.setCollideWorldBounds(true);

        this.player2 = new Player(this, this.scale.width-128, 384, true, true);
        this.player2.setEmitter(ballCreationEmitter);
        this.add.existing(this.player2);
        this.physics.add.existing(this.player2);
        this.player2.setCollideWorldBounds(true);

        this.physics.add.collider(this.player1, this.player2);

        this.score1 = 0;
        this.score2 = 0;

        this.basket1 = this.add.rectangle(this.player1.x-60, 120, 60, 80, 0xff0000).setAlpha(0);
        this.basket2 = this.add.rectangle(this.player2.x+60, 120, 60, 80, 0xff0000).setAlpha(0);
        
        this.physics.add.existing(this.basket1, true);
        this.physics.add.existing(this.basket2, true);

        ballCreationEmitter.on("createBall", (x: number, y: number, xVelocity: number, flipX: boolean) => {
            this.ball = new Ball(this, x, y);
            this.ball.setScale(0.5);
            this.add.existing(this.ball);
            this.physics.add.existing(this.ball);
            this.ball.setBounce(0.5, 0.5);
            this.ball.setCollideWorldBounds(true);


            if (xVelocity == 0) {
                xVelocity = 100;
            }

            if (this.ball.body) {
                const angle = flipX ? 240: -60;
                console.log(xVelocity);
                this.physics.velocityFromAngle(angle, Math.abs(xVelocity)*2, this.ball.body.velocity);
            }

            this.time.delayedCall(500, () => {
                this.physics.add.collider(this.player1, this.ball, () => {
                    this.player1.grabBall();
                    this.ball.destroy();
                });
                this.physics.add.collider(this.player2, this.ball, () => {
                    this.player2.grabBall();
                    this.ball.destroy();
                });
            });

        });
        ballCreationEmitter.emit("createBall", this.scale.width/2, this.scale.height/2, 0,0);
    }
    update()
    {
        this.player1.update();
        this.player2.update();
        this.checkBasketOverlap();
        this.checkScores()
    }

    private checkBasketOverlap()
    {
        const basket1Overlap: boolean = this.physics.overlap(this.ball, this.basket1);

        if (basket1Overlap && !this.alreadyOverlap) {
            this.alreadyOverlap = true;
            ++this.score1;
            this.msg_text.setText(`${this.score2}-${this.score1}`);
        }

        const basket2Overlap: boolean = this.physics.overlap(this.ball, this.basket2);
        if (basket2Overlap && !this.alreadyOverlap) {
            this.alreadyOverlap = true;
            ++this.score2;
            this.msg_text.setText(`${this.score2}-${this.score1}`);
        }

        if (this.alreadyOverlap && this.ball.body?.touching.none) {
            this.alreadyOverlap = false;
        }
    }

    private checkScores()
    {
        if (this.score2 == 15) {
            this.add.text(this.scale.width/2, this.scale.height/2, "ИГРАЧ 1 ПЕЧЕЛИ", {fontSize: 60}).setOrigin(0.5, 0);
            this.time.delayedCall(5000, () => {
                this.scene.start('MainMenu');
            });
        } else if (this.score1 == 15) {
            this.add.text(this.scale.width/2, this.scale.height/2, "ИГРАЧ 2 ПЕЧЕЛИ", {fontSize: 60}).setOrigin(0.5, 0);
            this.time.delayedCall(5000, () => {
                this.scene.start('MainMenu');
            });
        }
    }
}
