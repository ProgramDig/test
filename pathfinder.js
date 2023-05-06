// Визначаємо мапу та її центр
const map = L.map('map').setView([51.505, -0.09], 13);

// Додаємо тайловий шар OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18,
}).addTo(map);

// Визначаємо точки маршруту
const points = [
    {lat: 51.53, lng: -0.1},
    {lat: 51.51, lng: -0.08},
    {lat: 51.55, lng: -0.1},
    {lat: 51.525, lng: -0.12},
];

// Визначаємо функцію для визначення довжини маршруту
function routeLength(route) {
    let length = 0;
    for (let i = 0; i < route.length - 1; i++) {
        const p1 = route[i];
        const p2 = route[i + 1];
        const dLat = p2.lat - p1.lat;
        const dLng = p2.lng - p1.lng;
        length += Math.sqrt(dLat * dLat + dLng * dLng);
    }
    return length;
}

// Визначаємо клас для генетичного алгоритму
class GeneticAlgorithm {
    constructor(populationSize, mutationRate, crossoverRate, elitismCount) {
        this.populationSize = populationSize;
        this.mutationRate = mutationRate;
        this.crossoverRate = crossoverRate;
        this.elitismCount = elitismCount;
    }

    // Запускає генетичний алгоритм
    run(points, callback) {
        let population = this.initializePopulation(points);
        let bestRoute = null;

        for (let i = 0; i < 100; i++) {
            population = this.evolvePopulation(population);
            const currentBestRoute = population[0];
            if (!bestRoute || routeLength(currentBestRoute) < routeLength(bestRoute)) {
                bestRoute = currentBestRoute;
                callback(bestRoute);
            }
        }

        callback(bestRoute);
    }

    // Ініціалізує початкову популяцію
    initializePopulation(points) {
        const population = [];
        for (let i = 0; i < this.populationSize; i++) {
            const route = [...points];
            for (let j = 0; j < route.length; j++) {
                const k = Math.floor(Math.random() * route.length);
                [route[j], route[k]] = [route[k], route[j]];
            }
            population.push(route);
        }
        return population;
    }

    // Еволюціонує популяцію
    evolvePopulation(population) {
        const newPopulation = [];
        for (let i = 0; i < this.elitismCount; i++) {
            newPopulation.push(population[i]);
        }

        while (newPopulation.length < this.populationSize) {
            const parent1 = this.selectParent(population);
            const parent2 = this.selectParent(population);

            const child = this.crossover(parent1, parent2);
            this.mutate(child);

            newPopulation.push(child);
        }

        return newPopulation;


    }

    // Вибирає батьків для розмноження
    selectParent(population) {
        const tournamentSize = 5;
        let tournament = [];
        for (let i = 0; i < tournamentSize; i++) {
            const index = Math.floor(Math.random() * population.length);
            tournament.push(population[index]);
        }
        tournament.sort((a, b) => routeLength(a) - routeLength(b));
        return tournament[0];
    }

    // Здійснює кросовер
    crossover(parent1, parent2) {
        const child = [];
        const start = Math.floor(Math.random() * parent1.length);
        const end = Math.floor(Math.random() * (parent1.length - start)) + start;

        for (let i = 0; i < parent1.length; i++) {
            if (i >= start && i <= end) {
                child.push(parent1[i]);
            } else {
                child.push(null);
            }
        }

        for (let i = 0; i < parent2.length; i++) {
            const point = parent2[i];
            if (!child.includes(point)) {
                for (let j = 0; j < child.length; j++) {
                    if (child[j] === null) {
                        child[j] = point;
                        break;
                    }
                }
            }
        }

        return child;
    }

// Мутує рішення
    mutate(route) {
        for (let i = 0; i < route.length; i++) {
            if (Math.random() < this.mutationRate) {
                const j = Math.floor(Math.random() * route.length);
                [route[i], route[j]] = [route[j], route[i]];
            }
        }
    }

}


// Запускаємо генетичний алгоритм і відображаємо найкоротший шлях на мапі
// const geneticAlgorithm = new GeneticAlgorithm(100, 0.05, 0.9, 2);
// geneticAlgorithm.run(points, (route) => {
//     const latLngs = route.map((point) => [point.lat, point.lng]);
//     L.polyline(latLngs, {color: 'blue'}).addTo(map);
// });

L.Routing.control({
    waypoints: [
        L.latLng(55.54, 11.94),
        L.latLng(55.5792, 11.949)
    ],
    waypointNameFallback: function(latLng) {
        function zeroPad(n) {
            n = Math.round(n);
            return n < 10 ? '0' + n : n;
        }
        function sexagesimal(p, pos, neg) {
            var n = Math.abs(p),
                degs = Math.floor(n),
                mins = (n - degs) * 60,
                secs = (mins - Math.floor(mins)) * 60,
                frac = Math.round((secs - Math.floor(secs)) * 100);
            return (n >= 0 ? pos : neg) + degs + '°' +
                zeroPad(mins) + '\'' +
                zeroPad(secs) + '.' + zeroPad(frac) + '"';
        }

        return sexagesimal(latLng.lat, 'N', 'S') + ' ' + sexagesimal(latLng.lng, 'E', 'W');
    }
}).addTo(map);