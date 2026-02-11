const canvas = document.getElementById('ballCanvas');
const ctx = canvas.getContext('2d');

let mouseX = -100, mouseY = -100;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const BOND_THRESHOLD = 50;

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
    const size = getRandomValue(20, 60);
    const color = getRandomColor();
    const speedFactor = getRandomValue(0.5, 1.5);

    return {
        x: x,
        y: y,
        radius: size,
        color: color,
        velocityX: speedFactor * (Math.random() < 0.5 ? 1 : -1),
        velocityY: speedFactor * (Math.random() < 0.5 ? 1 : -1)
    };
}

const balls = [];
for (let i = 0; i < 10; i++) {
    balls.push(createBall(canvas.width / 2, canvas.height / 2));
}

function bondBalls(ballA, ballB) {
    const bondedBall = {
        x: (ballA.x + ballB.x) / 2,
        y: (ballA.y + ballB.y) / 2,
        radius: ballA.radius + ballB.radius,
        color: '#FF0000',
        velocityX: (ballA.velocityX + ballB.velocityX) / 2,
        velocityY: (ballA.velocityY + ballB.velocityY) / 2
    };

    balls.push(bondedBall);

    const indexA = balls.indexOf(ballA);
    if (indexA !== -1) balls.splice(indexA, 1);
    
    const indexB = balls.indexOf(ballB);
    if (indexB !== -1) balls.splice(indexB, 1);
}

function checkCollisionBetweenBalls(ballA, ballB) {
    const dx = ballA.x - ballB.x;
    const dy = ballA.y - ballB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < (ballA.radius + ballB.radius)) {
        resolveCollision(ballA, ballB);
    } else if (distance < BOND_THRESHOLD) {
        bondBalls(ballA, ballB);
    }
}

function resolveCollision(ballA, ballB) {
    const xVelocityDiff = ballA.velocityX - ballB.velocityX;
    const yVelocityDiff = ballA.velocityY - ballB.velocityY;

    const xDist = ballB.x - ballA.x;
    const yDist = ballB.y - ballA.y;

    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
        const angle = -Math.atan2(ballB.y - ballA.y, ballB.x - ballA.x);
        const u1 = rotate({ x: ballA.velocityX, y: ballA.velocityY }, angle);
        const u2 = rotate({ x: ballB.velocityX, y: ballB.velocityY }, angle);
        const v1 = { x: u1.x, y: u2.y };
        const v2 = { x: u2.x, y: u1.y };
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        ballA.velocityX = vFinal1.x;
        ballA.velocityY = vFinal1.y;
        ballB.velocityX = vFinal2.x;
        ballB.velocityY = vFinal2.y;
    }
}

function rotate(velocity, angle) {
    return {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            checkCollisionBetweenBalls(balls[i], balls[j]);
        }
    }

    for (let ball of balls) {
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
            ball.velocityX = -ball.velocityX;
        }

        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.velocityY = -ball.velocityY;
        }

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
