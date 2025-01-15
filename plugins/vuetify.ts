import {createVuetify, type ThemeDefinition} from 'vuetify'

const customDark: ThemeDefinition = {
    dark: true,
    colors: {
        background: '#000000',
        surface: '#FFFFFF',
        primary: '#02811B',
        'primary-darken-1': '#016415',
        secondary: '#000E03',
        'secondary-darken-1': '#01390c',
        error: '#F14E5C',
        info: '#2196F3',
        success: '#02811B',
        warning: '#FFA474',
    },
}

export default createVuetify({
    theme: {
        defaultTheme: 'customDark',
    },
})
