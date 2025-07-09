const resetPasswordMailDesign = (resetLink) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - AIC PECF</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f7fa;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f7fa; padding: 20px;">
        <tr>
            <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #3f6197 0%, #5a7bb8 100%); background-color: #3f6197; padding: 40px 30px; text-align: center; color: #ffffff;">
                            <h1 style="margin: 0 0 20px 0; font-size: 2.5rem; font-weight: bold; color: #ffffff;">AIC - PECF</h1>
                            <h2 style="margin: 0; font-size: 1.4rem; font-weight: 600; color: #ffffff;">Password Reset Request</h2>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px; text-align: center;">
                            <p style="margin: 0 0 30px 0; font-size: 1.1rem; color: #555555; line-height: 1.6;">
                                We received a request to reset your password. Click the button below to create a new password for your account.
                            </p>
                            
                            <!-- Animated Button -->
                            <table cellpadding="0" cellspacing="0" border="0" style="margin: 30px auto;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #3f6197 0%, #5a7bb8 100%); background-color: #3f6197; border-radius: 30px; 
                                        box-shadow: 0 0 0 0 rgba(63, 97, 151, 0.7);
                                        transition: box-shadow 1.5s ease-in-out;
                                        animation: pulse 1.5s infinite;">
                                        <a href="${resetLink}" 
                                            style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 1.1rem; border-radius: 30px;
                                            transition: transform 0.3s ease;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Timer Warning -->
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 15px; text-align: center;">
                                        <span style="color: #dc2626; font-weight: 600; font-size: 0.95rem;">
                                            ⏰ This link expires in 15 minutes
                                        </span>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 0.9rem; color: #666666; line-height: 1.5;">
                                If you did not request this password reset, you can safely ignore this email. Your account will remain secure and no changes will be made.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #6b7280; font-size: 0.85rem; line-height: 1.5;">
                                <span style="font-weight: 600; color: #3f6197;">AIC - PECF</span> Security Team<br>
                                This is an automated message, please do not reply to this email.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
}

export { resetPasswordMailDesign }