# 🦋 HorneTrack

**📦 This project was no longer work and stoped maintain since 2019 winter**

HornetTrack is a experimental project for auto stalk user on gay dating app Hornet.

- Inspired by [GrindrMap](https://grindrmap.neocities.org/)
- Motivated by [MapleStory BGM- Shattered Time ](https://www.youtube.com/watch?v=h_jJjw1TPyY)

## Concept
Tracking techinque is really simple : trilateration + flood of requests

Hornet blurring method is symmetry in all direction, which makes it easy to exploit an user accurate location with flood of requests.

### Here's how the webpage works:
#### Rought part
It is known that Hornet auto-blur user distance in certain range, and the highest accuracy is 80m. As the result, once you submit user account, sever will trilaterate user to a point in the range of 80m

#### Accurate part
In order to improve accuracy, it makes requests of every small interval from the point you just found in rough part.
After all requests done, take the average of locations in requests which response 80m from Hornet server.



## Report to Hornet
Hornet do not think the distance information is a fault.
They had discussed to restrict the information shown, but they don't think this is a positive impact.

> The decision to restrict the grid was not taken likely and we have tried to balance this with new features being added.

said Francisco, the hornet customer service.

## Prevention
1. Disable showing distance in setting, but be careful  of your followers, did you notice the followers is sorted by distance 😉?

2. Disable sharing your profile, which prevent your from being found by Hornet id.

## Developement

Make sure you have the following runtime
- [python](https://www.python.org/downloads/)>=3.6 
- [pipenv](https://github.com/pypa/pipenv): python package management and virtual environment 
- [yarn](https://yarnpkg.com/en/docs/install) or [npm](https://www.npmjs.com/get-npm): javascript package management

Clone this project and install dependencies. 
```
git clone https://github.com/timtorChen/hornettrack
cd hotnettrack
pipenv install 
yarn install
```

Build your local bundle files
```
yarn run webpack:build
```

Finally, build your local database and run server.
```
python manage.py migrate
python manage.py runserver 
```

## Disclaimer 
- Author have no legal liability to user's action.
- Do not abuse this website. The world is filled with love, go outside and explore a new story.
