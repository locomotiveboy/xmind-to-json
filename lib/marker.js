let MAKER = {};
MAKER.priority = [ //任务优先级
    'priority-1', 'priority-2', 'priority-3', 'priority-4', 'priority-5',
    'priority-6', 'priority-7', 'priority-8', 'priority-9'
];

MAKER.smiley = [ //表情
    'smiley-smile', 'smiley-laugh', 'smiley-angry', 'smiley-cry',
    'smiley-surprise', 'smiley-boring', 'smiley-embarrass'
];

MAKER.task = [ //任务进度
    'task-start', 'task-oct', 'task-quarter', 'task-3oct',
    'task-half', 'task-5oct', 'task-3quar', 'task-7oct',
    'task-done'
];

MAKER.flag = [ //旗子
    'flag-red', 'flag-orange', 'flag-blue', 'flag-green',
    'flag-purple', 'flag-dark-green', 'flag-dark-gray'
];

MAKER.star = [ //星星
    'star-red', 'star-orange', 'star-blue', 'star-green',
    'star-purple', 'star-dark-green', 'star-dark-gray'
];

MAKER.people = [ //人像
    'people-red', 'people-orange', 'people-blue', 'people-green',
    'people-purple', 'people-dark-green', 'people-dark-gray'
];

MAKER.arrow = [ //箭头
    'arrow-up', 'arrow-up-right', 'arrow-right', 'arrow-down-right',
    'arrow-down', 'arrow-down-left', 'arrow-left', 'arrow-up-left',
    'arrow-refresh'
];

MAKER.symbol = [ //符号
    'symbol-plus', 'symbol-minus', 'symbol-question', 'symbol-info',
    'symbol-attention', 'symbol-wrong', 'symbol-right', 'symbol-pause',
    'c_symbol_bar_chart', 'c_symbol_contact', 'c_symbol_dislike', 'c_symbol_drink',
    'c_symbol_exercise', 'c_symbol_flight', 'c_symbol_heart', 'c_symbol_like',
    'c_symbol_line_graph', 'c_symbol_medals', 'c_symbol_money', 'c_symbol_music',
    'c_symbol_pen', 'c_symbol_pie_chart', 'c_symbol_shopping_cart', 'c_symbol_telephone',
    'c_symbol_thermometer', 'c_symbol_trophy'
];

MAKER.month = [ //月份
    'month-jan', 'month-feb', 'month-mar', 'month-apr',
    'month-may', 'month-jun', 'month-jul', 'month-aug',
    'month-sep', 'month-oct', 'month-nov', 'month-dec'
];

MAKER.week = [ //星期
    'week-sun', 'week-mon', 'week-tue','week-wed',
    'week-thu', 'week-fri', 'week-sat'
];

const MARKER_TYPES = [
    'priority', 'smiley', 'task', 'flag',
    'star', 'people', 'arrow', 'symbol',
    'month', 'week'
];

function parseMarker (makerID) {
    for (let i = 0; i < MARKER_TYPES.length; i++) {
        let key = MARKER_TYPES[i];
        if (makerID.indexOf(key) > -1) {
            return {
                name: makerID,
                key: key,
                index: MAKER[key].indexOf(makerID)
            };
        }
    }
    return {};
}

module.exports = {
    parseMarker
};