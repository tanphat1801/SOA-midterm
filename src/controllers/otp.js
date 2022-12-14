const {
    otpService,
    userService,
    mailService,
    transactionService,
} = require('../services');
const catchAsync = require('../utils/catchAsync');

const otpController = {
    otpView: function (req, res, next) {
        const error = req.flash('error');
        res.render('otp', { title: 'Verify OTP', error });
    },

    verifyOtp: catchAsync(async (req, res, next) => {
        // req.body is required to have otp
        const otpCode = req.body.otp;

        if (!otpCode) {
            req.flash('error', 'Invalid OTP code');
            return res.redirect('/otp');
        }

        const transactionId = await otpService.get(otpCode);

        if (!transactionId) {
            req.flash('error', 'Invalid OTP code');
            return res.redirect('/otp');
        }

        req.otp = otpCode;
        req.transactionId = transactionId;
        next();
    }),

    resend: catchAsync(async (req, res, next) => {
        const transactionId = global.transactionId;
        const otpCode = global.otp;

        if (!transactionId || !otpCode) {
            req.flash('error', 'Something went wrong!');
            return res.redirect('/');
        }
        const user = await userService.get({ _id: req.user._id });

        await otpService.invalidate(otpCode);
        const otp = await otpService.create(transactionId);

        await transactionService.update(
            { _id: transactionId },
            { updatedAt: Date.now() }
        );

        await mailService.sendMail({
            to: user.email,
            subject:
                'Thank you for choosing our services. Here is your otp code',
            content: `<p>Please enter this otp to execute your transaction ${otp}</p>`,
        });
    }),
};

module.exports = otpController;
