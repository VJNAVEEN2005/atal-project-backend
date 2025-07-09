const resetPasswordMailDesign = (resetLink) => {
    return  `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - AIC PECF</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667db6 0%, #0082c8 25%, #0082c8 50%, #667db6 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            animation: gradientShift 8s ease-in-out infinite;
        }

        @keyframes gradientShift {
            0%, 100% { background: linear-gradient(135deg, #667db6 0%, #0082c8 25%, #0082c8 50%, #667db6 100%); }
            50% { background: linear-gradient(135deg, #0082c8 0%, #667db6 25%, #667db6 50%, #0082c8 100%); }
        }

        .email-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 40px rgba(63, 97, 151, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            animation: slideIn 0.8s ease-out;
            position: relative;
            overflow: hidden;
        }

        .email-container::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(63, 97, 151, 0.1), transparent);
            animation: shimmer 3s linear infinite;
        }

        @keyframes shimmer {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            position: relative;
            z-index: 1;
        }

        .logo {
            background: linear-gradient(135deg, #3f6197, #5a7bb8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 10px;
            animation: logoFloat 3s ease-in-out infinite;
        }

        @keyframes logoFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
        }

        .subtitle {
            color: #3f6197;
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 20px;
            animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .lock-icon {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #3f6197, #5a7bb8);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2s infinite;
            position: relative;
            z-index: 1;
        }

        @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(63, 97, 151, 0.7); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(63, 97, 151, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(63, 97, 151, 0); }
        }

        .lock-icon::before {
            content: '🔒';
            font-size: 24px;
            color: white;
        }

        .content {
            text-align: center;
            color: #333;
            line-height: 1.6;
            animation: fadeInUp 0.8s ease-out 0.4s both;
            position: relative;
            z-index: 1;
        }

        .message {
            font-size: 1.1rem;
            margin-bottom: 30px;
            color: #555;
        }

        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #3f6197, #5a7bb8);
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(63, 97, 151, 0.3);
            position: relative;
            overflow: hidden;
            animation: buttonGlow 2s ease-in-out infinite alternate;
        }

        @keyframes buttonGlow {
            from { box-shadow: 0 4px 15px rgba(63, 97, 151, 0.3); }
            to { box-shadow: 0 6px 20px rgba(63, 97, 151, 0.5); }
        }

        .reset-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }

        .reset-button:hover::before {
            left: 100%;
        }

        .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(63, 97, 151, 0.4);
        }

        .timer {
            margin: 30px 0;
            padding: 15px;
            background: rgba(63, 97, 151, 0.1);
            border-radius: 10px;
            border-left: 4px solid #3f6197;
            animation: fadeInUp 0.8s ease-out 0.6s both;
        }

        .timer-text {
            color: #3f6197;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }

        .timer-icon {
            animation: tickTock 1s infinite;
        }

        @keyframes tickTock {
            0%, 50% { transform: rotate(0deg); }
            25% { transform: rotate(10deg); }
            75% { transform: rotate(-10deg); }
        }

        .disclaimer {
            font-size: 0.9rem;
            color: #666;
            margin-top: 30px;
            animation: fadeInUp 0.8s ease-out 0.8s both;
        }

        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid rgba(63, 97, 151, 0.2);
            animation: fadeInUp 0.8s ease-out 1s both;
        }

        .footer-text {
            color: #666;
            font-size: 0.9rem;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .floating-elements {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
        }

        .floating-element {
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(63, 97, 151, 0.3);
            border-radius: 50%;
            animation: float 6s infinite linear;
        }

        .floating-element:nth-child(1) { left: 10%; animation-delay: 0s; }
        .floating-element:nth-child(2) { left: 20%; animation-delay: 1s; }
        .floating-element:nth-child(3) { left: 30%; animation-delay: 2s; }
        .floating-element:nth-child(4) { left: 40%; animation-delay: 3s; }
        .floating-element:nth-child(5) { left: 50%; animation-delay: 4s; }
        .floating-element:nth-child(6) { left: 60%; animation-delay: 5s; }
        .floating-element:nth-child(7) { left: 70%; animation-delay: 0.5s; }
        .floating-element:nth-child(8) { left: 80%; animation-delay: 1.5s; }
        .floating-element:nth-child(9) { left: 90%; animation-delay: 2.5s; }

        @keyframes float {
            0% {
                transform: translateY(100vh) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(-100px) rotate(360deg);
                opacity: 0;
            }
        }

        @media (max-width: 600px) {
            .email-container {
                padding: 30px 20px;
                margin: 10px;
            }
            
            .logo {
                font-size: 2rem;
            }
            
            .subtitle {
                font-size: 1.3rem;
            }
            
            .reset-button {
                padding: 12px 30px;
                font-size: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="floating-elements">
            <div class="floating-element"></div>
            <div class="floating-element"></div>
            <div class="floating-element"></div>
            <div class="floating-element"></div>
            <div class="floating-element"></div>
            <div class="floating-element"></div>
            <div class="floating-element"></div>
            <div class="floating-element"></div>
            <div class="floating-element"></div>
        </div>
        
        <div class="header">
            <h1 class="logo">AIC - PECF</h1>
            <div class="lock-icon"></div>
            <h2 class="subtitle">Password Reset Request</h2>
        </div>
        
        <div class="content">
            <p class="message">
                We received a request to reset your password. Click the button below to create a new password for your account.
            </p>
            
            <a href="${resetLink}" class="reset-button">
                Reset Password
            </a>
            
            <div class="timer">
                <div class="timer-text">
                    <span class="timer-icon">⏰</span>
                    This link expires in 15 minutes
                </div>
            </div>
            
            <p class="disclaimer">
                If you did not request this password reset, you can safely ignore this email. Your account will remain secure.
            </p>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                AIC - PECF Security Team<br>
                This is an automated message, please do not reply.
            </p>
        </div>
    </div>
</body>
</html>`
}

export { resetPasswordMailDesign }