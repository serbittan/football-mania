/**
 * @param {string} query - User's search query
 * @param {string} token - User's authorization token. To retrieve user's favourite teams
 * @param {function} callback - Callback to execute after retrieving search result. It returns error and an array
 * @throws Will throw an error if an argument doesn't match it's type
 */

function searchTeams(query, token, callback) {
    if (typeof token !== 'string') throw new TypeError(`${token} is not a string`)
    if (!token.trim()) throw new Error('token is empty')
    if (typeof query !== 'string') throw new TypeError(`${query} is not a string`)
    if (!query.trim()) throw new Error('query is empty')
    if (typeof callback !== 'function') throw new TypeError(`${callback} is not a function`)
    
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) throw new Error('token is invalid')

    /*try {
        const { sub } = JSON.parse(atob(tokenParts[1]))
        if(!sub) throw new Error('Invalid token. "Sub" does not exist in token')
    } catch (error) {
        throw new Error('token is not a valid base64 string')
    }*/

    if (typeof callback !== 'function') throw new TypeError(`${callback} is not a function`)

    const [, payload,] = tokenParts
    const payloadObject = JSON.parse(atob(payload))
    
    call(`https://skylabcoders.herokuapp.com/api/v2/users`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    }, (error, response) => {
        if (error) return callback(error)
        const content = JSON.parse(response.content)
        if (response.status !== 200) {
            callback(new Error(content.error))
        } else {
            let { footballFavs: favs } = content
            if (!favs) favs = []

            call(`https://www.thesportsdb.com/api/v1/json/1/searchteams.php?t=${encodeURI(query)}`, undefined, (error, response) => {
    
                if (error)  return callback(error)
                const content = JSON.parse(response.content)
                let teams = []
                if (!content.teams){
                   
                    return callback(new Error(content.error))
                }
                
                for (let i = 0; i < content.teams.length; i++) {
                    const team = content.teams[i]
                    // team.isFavorited = false

                    // if (favs.find(team.idTeam) === true) {
                    //     team.isFavorited = true
                    // }

                    team.isFavorited = favs.indexOf(team.idTeam) !== -1

                    // filtrar equips de primera divisió
                    if (team.idLeague == 4335) teams.push(team)
                }
                    
                callback(error, teams)
            })
        }
    })
}