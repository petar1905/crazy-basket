export class Ball extends Phaser.Physics.Arcade.Sprite {
    private static velocity: number = 200;

    public static getDefaultVelocity() {
        return Ball.velocity;
    }

    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y, "ball");
    }
}