const canvas = document.getElementById('ballCanvas');
const ctx = canvas.getContext('2d');

let mouseX = -100, mouseY = -100;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const colors = [
    getComputedStyle(document.body).getPropertyValue('--clr-bg').trim(),
    getComputedStyle(document.body).getPropertyValue('--clr-bg-alt').trim(),
    getComputedStyle(document.body).getPropertyValue('--clr-fg').trim(),
    getComputedStyle(document.body).getPropertyValue('--clr-fg-alt').trim(),
    getComputedStyle(document.body).getPropertyValue('--clr-primary').trim()
];

function getRandomValue(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function createBall(x, y) {
    const size = getRandomValue(10, 30); // サイズは10から30の間でランダムに決定
    const color = getRandomColor(); // ランダムにカラーを取得
    const speedFactor = getRandomValue(0.5, 1.5); // 速度の変動範囲を設定（0.5xから1.5xの速度）

    return {
        x: x,
        y: y,
        radius: size,
        color: color,
        velocityX: speedFactor * (Math.random() < 0.5 ? 1 : -1), // ランダムに左右の方向を選択
        velocityY: speedFactor * (Math.random() < 0.5 ? 1 : -1)  // ランダムに上下の方向を選択
    };
}

const balls = [];

// 6つのボールを追加
for (let i = 0; i < 6; i++) {
    balls.push(createBall(canvas.width / 2, canvas.height / 2));
}

function checkCollisionBetweenBalls(ballA, ballB) {
    const dx = ballA.x - ballB.x;
    const dy = ballA.y - ballB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < (ballA.radius + ballB.radius);
}

function resolveCollision(ballA, ballB) {
    const xDist = ballB.x - ballA.x;
    const yDist = ballB.y - ballA.y;
    const distance = Math.sqrt(xDist * xDist + yDist * yDist);
    const overlap = (ballA.radius + ballB.radius) - distance;

    // 角度と衝突後の速度の変更
    const angle = Math.atan2(yDist, xDist);
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    // ballA の位置を回転
    const pos0 = { x: 0, y: 0 };

    // ballB の相対的な位置を回転
    const pos1 = rotate(xDist, yDist, sin, cos, true);

    // ballA の速度を回転
    const vel0 = rotate(ballA.velocityX, ballA.velocityY, sin, cos, true);

    // ballB の速度を回転
    const vel1 = rotate(ballB.velocityX, ballB.velocityY, sin, cos, true);

    // 衝突の解決
    const vxTotal = vel0.x - vel1.x;
    vel0.x = ((ballA.radius - ballB.radius) * vel0.x + 2 * ballB.radius * vel1.x) / (ballA.radius + ballB.radius);
    vel1.x = vxTotal + vel0.x;

    // 位置を更新して衝突を避ける
    pos0.x += vel0.x;
    pos1.x += vel1.x;

    // 位置を元に戻す
    const pos0F = rotate(pos0.x, pos0.y, sin, cos, false);
    const pos1F = rotate(pos1.x, pos1.y, sin, cos, false);

    ballA.x = ballA.x + pos0F.x;
    ballA.y = ballA.y + pos0F.y;
    ballB.x = ballA.x + pos1F.x;
    ballB.y = ballA.y + pos1F.y;

    // 速度を元に戻す
    const vel0F = rotate(vel0.x, vel0.y, sin, cos, false);
    const vel1F = rotate(vel1.x, vel1.y, sin, cos, false);

    ballA.velocityX = vel0F.x;
    ballA.velocityY = vel0F.y;
    ballB.velocityX = vel1F.x;
    ballB.velocityY = vel1F.y;
}

function rotate(x, y, sin, cos, reverse) {
    return {
        x: (reverse) ? (x * cos + y * sin) : (x * cos - y * sin),
        y: (reverse) ? (y * cos - x * sin) : (y * cos + x * sin)
    };
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Check for ball collisions
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            if (checkCollisionBetweenBalls(balls[i], balls[j])) {
                resolveCollision(balls[i], balls[j]);
            }
        }
    }

    for (let ball of balls) {
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        // Bounce off the walls
        if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
            ball.velocityX = -ball.velocityX;
        }

        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.velocityY = -ball.velocityY;
        }

        // Bounce off the mouse cursor
        const distance = Math.sqrt((ball.x - mouseX) ** 2 + (ball.y - mouseY) ** 2);
        if (distance < ball.radius) {
            const angle = Math.atan2(ball.y - mouseY, ball.x - mouseX);
            ball.velocityX = 4 * Math.cos(angle);
            ball.velocityY = 4 * Math.sin(angle);
        }

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
    }

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
