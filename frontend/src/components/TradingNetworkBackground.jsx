import React, { useEffect, useRef } from 'react';

const TradingNetworkBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let nodes = [];
        let connections = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initNodes();
        };

        const initNodes = () => {
            nodes = [];
            const nodeCount = Math.floor((window.innerWidth * window.innerHeight) / 25000); // Density

            for (let i = 0; i < nodeCount; i++) {
                nodes.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5, // Slow horizontal movement
                    vy: (Math.random() - 0.5) * 0.5, // Slow vertical movement
                    radius: Math.random() * 1.5 + 0.5,
                    pulse: Math.random() * Math.PI * 2
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw nodes
            nodes.forEach(node => {
                node.x += node.vx;
                node.y += node.vy;
                node.pulse += 0.05;

                // Bounce off edges
                if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
                if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

                // Draw Node
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 255, 157, ${0.3 + Math.sin(node.pulse) * 0.2})`;
                ctx.fill();
            });

            // Draw Connections (Proximity)
            connections = [];
            ctx.lineWidth = 0.5;

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) { // Connection threshold
                        const opacity = 1 - dist / 150;
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.strokeStyle = `rgba(0, 255, 157, ${opacity * 0.15})`;
                        ctx.stroke();

                        // Occasional "Data Packet" traveling the line
                        if (Math.random() < 0.005) {
                            connections.push({
                                x: nodes[i].x,
                                y: nodes[i].y,
                                tx: nodes[j].x,
                                ty: nodes[j].y,
                                progress: 0
                            });
                        }
                    }
                }
            }

            // Draw Fast Packets
            // Note: We use a separate array or mechanism for persistent packets in a real engine,
            // but for lightweight effect, we can simulate "zaps" randomly on active lines
            // or iterate existing packets if we stored them. 
            // Simplified "Zap" effect:
            const time = Date.now() / 1000;
            nodes.forEach((node, i) => {
                if (i % 5 === 0) { // Only some nodes are sources
                    const nearby = nodes.filter(n => {
                        const d = Math.hypot(n.x - node.x, n.y - node.y);
                        return d < 150 && d > 10;
                    });

                    if (nearby.length > 0) {
                        const target = nearby[Math.floor(Math.random() * nearby.length)];
                        const speed = 2; // Speed factor
                        const offset = (time * speed) % 1;

                        const lx = node.x + (target.x - node.x) * offset;
                        const ly = node.y + (target.y - node.y) * offset;

                        ctx.beginPath();
                        ctx.arc(lx, ly, 1.5, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.fill();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0"
            style={{ opacity: 0.6 }}
        />
    );
};

export default TradingNetworkBackground;
