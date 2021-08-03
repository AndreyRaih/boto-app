import { BotActions } from "../types/action"

export const MESSAGES = {
    START_FIRST_MSG: 'Приветствую! Для начала, давайте познакомимся, как Вас зовут?',
    START_MSG: 'Хорошо, вы уже зарегистрированы, мы сбросили настройки вашего профиля до настроек по-умолчанию.',
    DEFAULT_MSG: 'Для того чтобы начать нажмите или введите - /run',
    SENDING_MSG: 'Введите сообщение, которое будет отправлено всем вашим подписчикам',
    ADMIN_MSG: 'Да здравствует новый администратор!',
    SUBSCRIBER_MSG: 'Спасибо за подписку. Обещаю, что спама не будет (но это не точно)',
    REGISTRATION: {
        FIRST_STEP: 'Отлично. Рад знакомству! Как можно с вами связаться?',
        SECOND_STEP: 'Отлично, теперь укажите, пожалуйста, адрес.',
        THIRD_STEP: 'Замечательно. Для того чтобы начать нажмите или введите - /run'
    },
    PAUSE_MSG: 'Уведомления остановлены, для того, чтобы возобновить их, используйте команду - /start',
    RESULT_MSG: 'Результат действия'
}

export const ACTIONS: BotActions.Action[] = [
    {
        trigger: '/run',
        type: 'SELECT',
        description: 'Тестовая форма выбора продукта',
        offerType: 'PRODUCT',
        options: [
            {
                id: '1',
                text: 'Тестовый продукт',
                description: 'Test input 1',
                options: [
                    {
                        id: '1-1',
                        parentId: '1',
                        text: 'Категория 1-1',
                        description: 'Test category 1-1',
                        options: [
                            {
                                id: '1-1-1',
                                parentId: '1-1',
                                text: 'Продукт 1-1-1',
                                description: 'Test item 1-1-1',
                            },
                            {
                                id: '1-1-2',
                                parentId: '1-1',
                                text: 'Продукт 1-1-2',
                                description: 'Test item 1-1-2',
                            }
                        ]
                    },
                    {
                        id: '1-2',
                        parentId: '1',
                        text: 'Категория 1-2',
                        description: 'Test category 1-2',
                        options: [
                            {
                                id: '1-2-1',
                                parentId: '1-2',
                                text: 'Продукт 1-2-1',
                                description: 'Test item 1-2-1',
                            },
                            {
                                id: '1-2-2',
                                parentId: '1-2',
                                text: 'Продукт 1-2-2',
                                description: 'Test item 1-2-2',
                            }
                        ]
                    }
                ]
            }
        ]
    }
]