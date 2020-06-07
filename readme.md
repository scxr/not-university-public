
## not univeristy hackathon - 2020
## Our inspiration

After my father helped me plant a little seedling, I believe it was mint, for days we struggled to water it in our dry climate and protect it from the harsh rays of the sun. I realized that the joy of home gardening is often spoiled by natural factors like sunlight and especially lack of water. After more research I discovered that poor water quality causes the US to be ranked 7th (i think) in overall water quality.This is why for this hackathon we have decided to make a website that would account for those factor so that gardening would be available for everyone regardless of water conditions and help us save more water whilst doing something productive.

## What it does
### The base idea
So, the beginning idea was such: a user would visit our website and enter a plant, we would then use the rainfall and the amount of water the plant needed to grow to suggest whether or not the plant should be grown. An early design can be seen here:
![Imgur](https://i.imgur.com/t0cpZWD.png)

### Extending the idea
This idea further evolved as we discussed what we should do aswell as analysing the data that was available to us, we decided to go with water precipitation bounds as that is likely to be the most accurate in the decision of whether something should be planted or not, we also added some extra data for interest. We changed our design to fit our domain name : mygreen.space. The site looks like this on desktop:
![Imgur](https://imgur.com/Pg1yjQE.png)

As-well as looking good on mobile: 
![Imgur](https://imgur.com/KKrdhTo.png)

This was the design we went with, we needed some further enhancements however, the website would crash if people from non-US tried to access and we also needed a search function, so we checked the IP was american and if it wasn't displayed this: 
![Imgur](https://imgur.com/pLKL26p.png)

And then we added search which auto filtered to your search term as you typed, so if you started typing lilly it would only show lilly plants. The final product came to looking like this:
![Imgur](https://imgur.com/d1BF5XJ.png)

As you can see, in our final product we highlight incompatible plants in red as-well as allowing the user to search for the plant they want and filtering accordingly

## How we built it
### Coming up with the idea and preparing it
The night before the team rolled into the group vc questioning what we could do for such a broad topic of "water", we spent about an hour or two and between long periods of silent googling and throwing around ideas we ("TheGuy")  finally came up with the idea that we would pursue. Our idea was an online web app that would help farmers/hobbyists see what plants they should plant based on the area they live in and the precipitation average over a large amount of years.  We had a google around to see if this problem was feasible and computable and it looked it, and with that we headed off awaiting the next day when the hackathon started.
When the hackathon we started by dividing the problem into different sections which each user could excel there skills in and make the development faster. We were heading for the categories of: "Best Water Hack", "Best hack for social good", "Best UI/UX", "Best Use of Atlas MongoDB" so we made sure that we tailored our solution to these. We split up the categories in the following back end: "c3a", "nemo", "TheGuy" and then "kachang" would float between developing the react side of the website and assisting with the backend. The technologies we incorporated were: Flask (backend), MongoDB Atlas (DB work) and React (frontend). With each member working on there respected sections .
### The backend
We started by accumulating data for the precipitation and we went with the NOAA's data, the biggest challenge to do with this was the way the data was formatted, you can find the data files we used here [file1]('[https://www1.ncdc.noaa.gov/pub/data/normals/1981-2010/products/precipitation/ann-prcp-normal.txt](https://www1.ncdc.noaa.gov/pub/data/normals/1981-2010/products/precipitation/ann-prcp-normal.txt)') and [file2]('[https://www1.ncdc.noaa.gov/pub/data/normals/1981-2010/station-inventories/zipcodes-normals-stations.txt](https://www1.ncdc.noaa.gov/pub/data/normals/1981-2010/station-inventories/zipcodes-normals-stations.txt)') , we needed them in the format of: `station average zip_code city` however not all the stations were in the files, so i had to make sure i got the ones that were common, so i hacked together some code and came out with this:
```py
with open('data_without_zipcodes.txt') as infile:  
	no_zips = infile.read().split('\n')  
with open('data_with_zipcodes.txt') as infile:  
	with_zips = infile.read().split('\n')  
result = []  
tmp_str = ''  
tmp_cnt = 0  
for i in with_zips:  
	for j in no_zips:  
		try:  
			if i.split()[0] == j.split()[0]:  
				result.append(f'{j} {i.split()[1]} {" ".join(i.split()[2:])}')  
			elif tmp_cnt == len(no_zips):  
				break  
			else:  
				pass  
		except:  
			pass  
with open('final_data','w') as f:  
	f.write('\n'.join(result))
```
So this gave us ~9200 results and we pushed this into our Mongo Atlas DB, only to realise one imposing issue, cities had duplicated entries, so it was time to get back to hacking some solution for this, i am not familiar with NoSQL so i created an sqlite3 database to hold our data temporarily and i would use this to get the averages with this ugly (yet working) code:
```py
import sqlite3
with open('final_data','r') as f:  
	data = f.read().split('\n')  
def get_avg():  
	searched = []  
	result = []  
	total = 0  
	for i in data:  
		rainfall = i.split()[1]  
		name = ' '.join(i.split()[3:])  
		station_id = i.split()[0]  
		zip_code = i.split()[2]  
		if name not in searched:  
			conn = sqlite3.connect('main.db')  
			c = conn.cursor()  
			c.execute('select * from dat where city_name = ?',(name,))  
			resp = c.fetchall()  
			conn.commit()  
			conn.close()  
			searched.append(name)  
			for i in resp:  
				total += int(i[2][:len(i[2])-1])  
				avg = total//len(i)  
				result.append(f'{station_id} {avg} {zip_code} {name}')  
		else:  
			print('already done this one')  
		total = 0  
	with open('average_out','w') as f:  
		f.write('\n'.join(result))
```
This finally gave us the dataset we needed, we then sent this into our MongoAtlas DB to use in our project. The next was collecting plants that prospered in differing environments, we went with [trefel api]('https://trefle.io') now, our original idea was allow the user to search if there plant was good for conditions, however we soon realised the api has a shortage of complete data and therefore a lack of info on whether the plant is good for said conditions. So instead we generated a thousand plants in a variety of conditions, that we could suggest to the user based on there location. This ultimately worked and is what we incorporated. We put these 1k+ plants in our Mongo Atlas DB. This just about concludes the back-end development of the site.

### The frontend
We decided to completely split off the frontend development from the backend and just use the backend to query our data in MongoDB so we could do more concurrently. We used Next.js and the Tailwind CSS library. Since the frontend was decoupled from the backend, we mocked up the data we would eventually get from the backend and built the simple and visually appealing layout. It worked out well, and we were able to finish around the same time and link the back and front ends up with too much of a hassle. Since we still had a lot of time left, we added more features to the user interface such as a search.


## What we learned
- MongoDB
- Building a REST api in python using flask
- Using external apis in our project
- Working on the code collaboratively using Github
- Connecting the frontend with the REST api

## What's next for green space
- Extend our dataset to support more countires around the globe
- Add more plants of different types to our database

You can find our code at this repo: https://github.com/cswil/not-university-public (all secrets redacted :p)
