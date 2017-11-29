'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
getEmitter.isStar = true;
module.exports = getEmitter;

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    return {

        events: {},

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object}
         */
        on: function (event, context, handler) {
            let obj = onFunc(this.events, event, context, handler);
            this.events[event].push(obj);

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object}
         */
        off: function (event, context) {
            let unsubEvents = Object.keys(this.events).filter((ev) => {
                return ev.startsWith(event + '.') || ev === event;
            });
            unsubEvents.forEach(function (unsubEv) {
                this.events[unsubEv] = this.events[unsubEv].filter((obj) => {
                    return obj.context !== context;
                });
            }, this);

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object}
         */
        emit: function (event) {
            let events = splitToNamespace(event);
            events.forEach(function (item) {
                if (!this.events[item]) {
                    return;
                }
                this.events[item].forEach(function (obj) {
                    obj.handler();
                }, this);
            }, this);

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object}
         */
        several: function (event, context, handler, times) {
            let numsOfEvents = 0;

            let obj = onFunc(this.events, event, context, () => {
                if (numsOfEvents <= (times - 1)) {
                    handler.call(context);
                }
                numsOfEvents++;
            });
            this.events[event].push(obj);

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object}
         */
        through: function (event, context, handler, frequency) {
            let numsOfEvents = 0;
            let obj = onFunc(this.events, event, context, () => {
                let count = numsOfEvents % frequency;
                if (count === 0 && frequency !== 0) {
                    handler.call(context);
                }
                numsOfEvents++;
            });
            this.events[event].push(obj);

            return this;
        }
    };
}

function splitToNamespace(event) {
    let events = event.split('.');

    return events.reduce(function (prev, curr, index) {
        if (index === 0) {
            prev.push(curr);
        } else {
            prev.push(prev[index - 1] + '.' + curr);
        }

        return prev;
    }, [])
        .reverse();
}

function onFunc(events, event, context, handler) {
    if (!events.hasOwnProperty(event)) {
        events[event] = [];
    }

    return { context: context,
        handler: handler.bind(context) };
}
