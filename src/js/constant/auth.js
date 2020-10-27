import Cookies from 'js-cookie'

const CSRF_TOKEN = Cookies.get('csrftoken')
const testtoken = Cookies.get('token')

export default{
    testtoken,
    CSRF_TOKEN
}