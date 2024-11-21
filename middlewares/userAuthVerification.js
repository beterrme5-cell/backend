export const userAuthVerification = (req, res, next) => {

    const accountId = req.cookies.accountId;
    const userLocationId = req.cookies.userLocationId;

    console.log(accountId, userLocationId);

    if (!accountId || !userLocationId || accountId == undefined || userLocationId == undefined) {
        return res.status(401).send({
            message: "Unauthorized Access"
        })
    }

    req.user = {
        accountId,
        userLocationId
    }

    next();
};