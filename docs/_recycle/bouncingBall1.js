function createStar(x, y, angle) {
    const speed = getRandomValue(1, 5);
    return {
        x: x,
        y: y,
        length: 5, // これは星の大きさを表します。好みに応じて変更できます。
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        life: 0.5,  // 0.5秒
    };
}

const stars = [];

function generateStarsOnCollision(ballA, ballB) {
    const collisionAngle = Math.atan2(ballB.y - ballA.y, ballB.x - ballA.x);
    const numberOfStars = 10; // 任意の数の星を生成します。
    for (let i = 0; i < numberOfStars; i++) {
        const angle = collisionAngle + (Math.PI * 2 / numberOfStars) * i;
        stars.push(createStar((ballA.x + ballB.x) / 2, (ballA.y + ballB.y) / 2, angle));
    }
}

function animateStars(dt) {
    for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        star.x += star.velocityX;
        star.y += star.velocityY;
        star.life -= dt; // dtは前回のフレームからの経過時間を秒単位で示します。

        // 星の描画
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x + star.length * Math.cos(star.angle), star.y + star.length * Math.sin(star.angle));
        ctx.strokeStyle = 'white'; // 任意の色
        ctx.stroke();

        if (star.life <= 0) {
            stars.splice(i, 1);
        }
    }
}

let lastTime = Date.now();

function animate() {
    const currentTime = Date.now();
    const dt = (currentTime - lastTime) / 1000; // 経過時間を秒単位で取得

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ...

    // 衝突が発生したときの星の生成
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            if (checkCollisionBetweenBalls(balls[i], balls[j])) {
                generateStarsOnCollision(balls[i], balls[j]);
            }
        }
    }

    // 星のアニメーション
    animateStars(dt);

    // ...

    lastTime = currentTime;
    requestAnimationFrame(animate);
}


animate();

canvas.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    for (let ball of balls) {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
    }
});
