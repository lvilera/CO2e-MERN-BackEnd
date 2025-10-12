const Subscription = require('../models/Subscription');

const addSubscription = async (data) => {
    try {
        const { user, customerId, subscriptionInfo } = data;
        const existingUserSubscription = await Subscription.findOne({ user });
        if (!existingUserSubscription) {
            const newSubscription = await Subscription.create({
                user,
                customerId,
                subscriptions: [subscriptionInfo]
            });
        }
        else {
            existingUserSubscription.subscriptions.forEach(sub => {
                if (sub.status === 'active') {
                    sub.status = 'inactive';
                }
            });
            existingUserSubscription.customerId = customerId;
            existingUserSubscription.subscriptions.push(subscriptionInfo);
            await existingUserSubscription.save();
        }
    } catch (error) {
        console.log('AddSubscriptionError: ', error);
        const newError = new Error(`Unable to add subscription!`);
        newError.code = 400;
        throw newError;
    }
};

const getUserSubscriptionInfo = async (userId) => {
    const subscription = await Subscription.findOne({ user: userId });
    if (!subscription) {
        return {
            status: false,
            subscriptionId: '',
            planName: '',
            productId: '',
            priceId: '',
            amount: null,
            autoRenew: false
        };
    }
    const now = new Date();
    let status = false;
    let subscriptionId = '';
    let planName = '';
    let productId = '';
    let priceId = '';
    let amount = null;
    let autoRenew = false;

    const activeSubscription = subscription.subscriptions.find(sub => {
        return sub.endDate >= now && sub.status === 'active';
    });

    // console.log(subscription,'subscription')

    if (activeSubscription) {
        status = true;
        subscriptionId = activeSubscription.subscriptionId;
        planName = activeSubscription.planInfo.name;
        productId = activeSubscription.planInfo.productId;
        priceId = activeSubscription.planInfo.priceId;
        amount = activeSubscription.planInfo.amount;
        autoRenew = activeSubscription.autoRenew;
    }

    return {
        status,
        subscriptionId,
        planName,
        productId,
        priceId,
        amount,
        autoRenew
    };
};

module.exports = {
    addSubscription,
    getUserSubscriptionInfo,
}