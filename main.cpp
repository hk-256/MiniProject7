#include<bits/stdc++.h>
using namespace std;

// Structure Definitions
struct Customer {
    int id;
    int x;
    int y;
    int demand;
    int readyTime;
    int dueTime;
    int serviceTime;
};

struct Route {
    std::vector<int> customers;
    int totalDemand = 0;
    double totalDistance = 0;
    int endTime = 0; // Time when route ends
};

// Solution Structure
struct Solution {
    vector<Route> routes;
    double totalDistance = 0;
    int numVehicles = 0;
    int rank = 0; // Pareto front rank
    int index =  0;
    double crowdingDistance = 0.0;
};

// Utility Functions
int calculateTravelTime(const Customer &a, const Customer &b) {
    // return 1;
    // Euclidean distance, can be adjusted for other distances
    return (int)sqrt((a.x - b.x)*(a.x - b.x) + (a.y - b.y)*(a.y - b.y));
}
// Evaluate Solution Fitness
Solution evaluateSolution( const std::vector<Route> &routes, const std::vector<Customer> &customers) {
    Solution solution;
    solution.numVehicles = routes.size();

    for (const auto &route : routes) {
        double routeDistance = 0;
        int prev = 0; // Start at depot
        for (int customerId : route.customers) {
            routeDistance += calculateTravelTime(customers[prev], customers[customerId]);
            prev = customerId;
        }
        // Return to depot
        routeDistance += calculateTravelTime(customers[prev], customers[0]);
        solution.totalDistance += routeDistance;
    }
    solution.routes = routes;
    return solution;
}

bool canInsertAtPosition( Route route, const std::vector<Customer>& customers, int customerId, int position, int vehicleCapacity, int depotCloseTime) {
    // Create a temporary copy of the route to test insertion
    Route tempRoute = route;
    tempRoute.customers.insert(tempRoute.customers.begin() + position, customerId);
    tempRoute.totalDemand += customers[customerId].demand; // Map ID to customer

    // Check capacity constraint
    if (tempRoute.totalDemand > vehicleCapacity) {
        return false;
    }

    // Recalculate times for the entire route
    int currentTime = 0;
    for (size_t i = 1; i < tempRoute.customers.size(); ++i) {
        int prevCustomerId = tempRoute.customers[i - 1];
        int currentCustomerId = tempRoute.customers[i];
        const Customer& prevCustomer = customers[prevCustomerId];
        const Customer& currentCustomer = customers[currentCustomerId];

        int travelTime = calculateTravelTime(prevCustomer, currentCustomer);
        currentTime = std::max(currentTime + travelTime, currentCustomer.readyTime);

        // Check time window constraint
        if (currentTime > currentCustomer.dueTime) {
            return false;
        }

        currentTime += currentCustomer.serviceTime;
        
        // back to depoy check the dist
        if(currentTime +calculateTravelTime(currentCustomer, customers[0]) > customers[0].dueTime){
            return false;
        }
    }
    

    return true;
}

Solution Better(const Solution &parent1, const Solution &parent2,int obj){
    if(obj == 1){ // vehicle min
        if(parent1.numVehicles <= parent2.numVehicles)return parent1;
        return parent2;
    }
    if(parent1.totalDistance <= parent2.totalDistance)return parent1;
    return parent2;
}
bool isdominate(const Solution &parent1, const Solution &parent2){
    if(parent1.numVehicles<parent2.numVehicles && parent1.totalDistance<parent2.totalDistance)
        return true;
    return false;
}
bool is_good (const Solution &parent1, const Solution &parent2,int obj){
    if(obj == 1 && parent1.numVehicles<parent2.numVehicles )return true;
    if(obj == 2 && parent1.totalDistance<parent2.totalDistance)return true;
    return false;
}
bool is_unique_child(const Solution child , const vector<Solution>&population){
     for(auto it:population){
        if(it.numVehicles == child.numVehicles && it.totalDistance == child.totalDistance)return false;
     }
     return true;
}

void calculateCrowdingDistance(vector<Solution> &front) {
    int frontSize = front.size();

    if (frontSize <= 2) {
        // Assign infinite crowding distance for trivial fronts
        for (auto &solution : front) {
            solution.crowdingDistance = numeric_limits<double>::infinity();
        }
        return;
    }

    // Step 1: Initialize crowding distance to 0
    for (auto &solution : front) {
        solution.crowdingDistance = 0.0;
    }

    // Step 2: Calculate crowding distance for Objective 1 (totalDistance)
    vector<pair<double, int>> distances(frontSize);
    for (int i = 0; i < frontSize; ++i) {
        distances[i] = {front[i].totalDistance, i};
    }
    sort(distances.begin(), distances.end());

    // Boundary solutions have infinite crowding distance
    front[distances[0].second].crowdingDistance = numeric_limits<double>::infinity();
    front[distances[frontSize - 1].second].crowdingDistance = numeric_limits<double>::infinity();

    // Calculate crowding distance for the rest
    for (int i = 1; i < frontSize - 1; ++i) {
        double normalized = distances[frontSize - 1].first - distances[0].first;
        if (normalized > 0.0) {
            front[distances[i].second].crowdingDistance +=
                (distances[i + 1].first - distances[i - 1].first) / normalized;
        }
    }

    // Step 3: Calculate crowding distance for Objective 2 (numVehicles)
    for (int i = 0; i < frontSize; ++i) {
        distances[i] = {front[i].numVehicles, i};
    }
    sort(distances.begin(), distances.end());

    // Boundary solutions for numVehicles also have infinite crowding distance
    front[distances[0].second].crowdingDistance = numeric_limits<double>::infinity();
    front[distances[frontSize - 1].second].crowdingDistance = numeric_limits<double>::infinity();

    // Calculate crowding distance for the rest
    for (int i = 1; i < frontSize - 1; ++i) {
        double normalized = distances[frontSize - 1].first - distances[0].first;
        if (normalized > 0.0) {
            front[distances[i].second].crowdingDistance +=
                (distances[i + 1].first - distances[i - 1].first) / normalized;
        }
    }
}


// Crossover Operator
Solution crossover(const Solution &parent1, const Solution &parent2, const vector<Customer> &customers, int vehicleCapacity, int depotCloseTime, int objective) {
    Solution child;
    set<int> visitedCustomers;

    vector<Route> childRoutes;

    // Phase 1: Select "k" most promising routes
    int MINR = min(parent1.routes.size(), parent2.routes.size());
    int MAXR = max(parent1.routes.size(), parent2.routes.size());
    int k = (objective == 1) ? (MINR - 1) : MINR;

    for (int i = 0; i < k; ++i) {
        const Solution &parent = (rand() % 2 == 0) ? parent1 : parent2;
        Route mostPromisingRoute;

        if (objective == 1) {
            // f1: Select route with maximum customers
            mostPromisingRoute = *max_element(parent.routes.begin(), parent.routes.end(),
                                              [](const Route &a, const Route &b) { return a.customers.size() < b.customers.size(); });
        } else if (objective == 2) {
            // f2: Select route with smallest distance-to-customer ratio
            mostPromisingRoute = *min_element(parent.routes.begin(), parent.routes.end(),
                                              [&](const Route &a, const Route &b) {
                                                  double ratioA = a.totalDistance / a.customers.size();
                                                  double ratioB = b.totalDistance / b.customers.size();
                                                  return ratioA < ratioB;
                                              });
        }

        childRoutes.push_back(mostPromisingRoute);

        // Mark customers as visited and remove them from both parents
        for (int customerId : mostPromisingRoute.customers) {
            visitedCustomers.insert(customerId);
        }
    }

    // Phase 2: Insert unassigned customers
    for (const auto &parent : {parent1, parent2}) {
        for (const auto &route : parent.routes) {
            for (int customerId : route.customers) {
                if (visitedCustomers.find(customerId) == visitedCustomers.end()) {
                    // Find the best position for the unassigned customer
                    bool inserted = false;

                    for (auto &childRoute : childRoutes) {
                        for (size_t pos = 1; pos < childRoute.customers.size(); ++pos) {
                            Route tempRoute = childRoute;
                            tempRoute.customers.insert(tempRoute.customers.begin() + pos, customerId);
                            tempRoute.totalDemand += customers[customerId].demand;

                            if (tempRoute.totalDemand > vehicleCapacity) continue;

                            // Calculate travel time and check feasibility
                            int currentTime = 0;
                            for (size_t i = 1; i < tempRoute.customers.size(); ++i) {
                                int prevCustomer = tempRoute.customers[i - 1];
                                int currCustomer = tempRoute.customers[i];
                                const Customer &prev = customers[prevCustomer];
                                const Customer &curr = customers[currCustomer];

                                currentTime = max(currentTime + calculateTravelTime(prev, curr), curr.readyTime);
                                if (currentTime > curr.dueTime) break;

                                currentTime += curr.serviceTime;
                            }

                            if (currentTime + calculateTravelTime(customers[tempRoute.customers.back()], customers[0]) <= depotCloseTime) {
                                childRoute = tempRoute;
                                visitedCustomers.insert(customerId);
                                inserted = true;
                                break;
                            }
                        }
                        if (inserted) break;
                    }

                    if (!inserted) {
                        // Create a new route if no feasible position is found
                        Route newRoute;
                        newRoute.customers.push_back(0);
                        newRoute.customers.push_back(customerId);
                        newRoute.customers.push_back(0);
                        newRoute.totalDemand = customers[customerId].demand;
                        childRoutes.push_back(newRoute);
                        visitedCustomers.insert(customerId);
                    }
                }
            }
        }
    }

    return evaluateSolution(childRoutes, customers);
}
// Mutation Operator
Solution mutate(const Solution &parent, const vector<Customer> &customers, int vehicleCapacity, int depotCloseTime, int objective) {
    Solution solution = parent;
    if (solution.routes.empty()) return solution;

    // Step 1: Select a random route and a random customer
    int routeIdx = rand() % solution.routes.size();
    Route &selectedRoute = solution.routes[routeIdx];

    if (selectedRoute.customers.size() <= 2) return solution; // Skip mutation if route has only depot

    int customerIdx = 1 + rand() % (selectedRoute.customers.size() - 2); // Avoid depot
    int customerId = selectedRoute.customers[customerIdx];

    // Remove customer from current route
    selectedRoute.customers.erase(selectedRoute.customers.begin() + customerIdx);
    selectedRoute.totalDemand -= customers[customerId].demand;

    // Step 2: Find the best feasible position for the removed customer
    bool inserted = false;
    for (auto &route : solution.routes) {
        for (size_t pos = 1; pos < route.customers.size(); ++pos) {
            Route tempRoute = route;
            tempRoute.customers.insert(tempRoute.customers.begin() + pos, customerId);
            tempRoute.totalDemand += customers[customerId].demand;

            // Check capacity constraint
            if (tempRoute.totalDemand > vehicleCapacity) continue;

            // Check time window constraints
            int currentTime = 0;
            bool feasible = true;
            for (size_t i = 1; i < tempRoute.customers.size(); ++i) {
                int prevCustomer = tempRoute.customers[i - 1];
                int currCustomer = tempRoute.customers[i];
                const Customer &prev = customers[prevCustomer];
                const Customer &curr = customers[currCustomer];

                currentTime = max(currentTime + calculateTravelTime(prev, curr), curr.readyTime);
                if (currentTime > curr.dueTime) {
                    feasible = false;
                    break;
                }
                currentTime += curr.serviceTime;
            }

            if (!feasible) continue;

            // Evaluate the insertion position based on the objective
            if (objective == 1) {
                // f1: Minimize vehicles, first feasible position
                route = tempRoute;
                inserted = true;
                break;
            } else if (objective == 2) {
                // f2: Minimize distance, best position with least increment in distance
                double newDistance = evaluateSolution({tempRoute}, customers).totalDistance;
                double oldDistance = evaluateSolution({route}, customers).totalDistance;
                if (newDistance < oldDistance) {
                    route = tempRoute;
                    inserted = true;
                }
            }
        }
        if (inserted) break;
    }

    // Step 3: Create a new route if no feasible position is found
    if (!inserted) {
        Route newRoute;
        newRoute.customers.push_back(0); // Start at depot
        newRoute.customers.push_back(customerId);
        newRoute.customers.push_back(0); // Return to depot
        newRoute.totalDemand = customers[customerId].demand;
        solution.routes.push_back(newRoute);
    }

    // Recalculate total distance and number of vehicles
    solution = evaluateSolution(solution.routes, customers);
    return solution;
}

// Function to Generate Initial Population
std::vector<Route> generateInitialPopulation(
    const std::vector<Customer> &customers,
    int vehicleCapacity,
    int depotReadyTime,
    int depotCloseTime
) {
    std::vector<Route> population;
    std::vector<int> unassignedCustomers;

    // Initialize unassigned customers with all customer IDs (skip depot)
    for (const auto &customer : customers) {
        if (customer.id != 0) unassignedCustomers.push_back(customer.id);
    }

    // Seed random generator
     std::srand(std::time(0)+rand());

    // Process unassigned customers
    while (!unassignedCustomers.empty()) {
        int randomIndex = std::rand() % unassignedCustomers.size();
        // cout<<unassignedCustomers[randomIndex]<<" ";
        int customerId = unassignedCustomers[randomIndex];
        bool assigned = false;
        int index = -1;
        for(int i=0;i<population.size();i++){
            Route currentroute = population[i];
            for (size_t position = 1; position <= currentroute.customers.size(); ++position) {
                if (canInsertAtPosition(currentroute, customers, customerId, position, vehicleCapacity, depotCloseTime)) {
                    currentroute.customers.insert(currentroute.customers.begin() + position, customerId);
                    currentroute.totalDemand += customers[customerId].demand;
                    assigned = true;
                    population[i] = currentroute;
                    break;
                }
            }
            if(assigned)break;
        }
        if(assigned == false){
            Route newRoute;
            newRoute.customers.push_back(0); // Start at depot
            newRoute.totalDemand += customers[customerId].demand;
            newRoute.customers.push_back(customerId);
            newRoute.endTime = depotReadyTime+max(customers[customerId].readyTime,calculateTravelTime(customers[0],customers[customerId]));
            // cout<<newRoute.endTime<<" ";
            newRoute.endTime += customers[customerId].serviceTime;
            population.push_back(newRoute);
        }
        
        unassignedCustomers.erase(unassignedCustomers.begin() + randomIndex);
        
    }

    return population;
}

// Function to perform non-dominated sorting
vector<vector<Solution>> nonDominatedSorting(vector<Solution> &population) {
    int populationSize = population.size();
    vector<vector<int>> fronts;    // Pareto fronts
    vector<int> dominationCount(populationSize, 0); // Count of solutions dominating each solution
    vector<vector<int>> dominatedSolutions(populationSize); // Solutions dominated by each solution

    // Step 1: Compare every pair of solutions
    for (int i = 0; i < populationSize; ++i) {
        for (int j = 0; j < populationSize; ++j) {
            if (i == j) continue;

            // Check if solution[i] dominates solution[j]
            bool dominates = ((population[i].totalDistance < population[j].totalDistance && 
                              population[i].numVehicles <= population[j].numVehicles) ||
                             (population[i].totalDistance <= population[j].totalDistance && 
                              population[i].numVehicles < population[j].numVehicles));

            if (dominates) {
                dominatedSolutions[i].push_back(j); // i dominates j
            } else if ((population[j].totalDistance < population[i].totalDistance && 
                        population[j].numVehicles <= population[i].numVehicles) ||
                       (population[j].totalDistance <= population[i].totalDistance && 
                        population[j].numVehicles < population[i].numVehicles)) {
                dominationCount[i]++; // j dominates i
            }
        }

        // If no solution dominates i, it belongs to the first front
        if (dominationCount[i] == 0) {
            population[i].rank = 0; // First Pareto front
            if (fronts.empty()) fronts.emplace_back();
            fronts[0].push_back(i);
        }
    }

    // Step 2: Build remaining fronts
    int currentFront = 0;
    while (currentFront < fronts.size()) {
        vector<int> nextFront;

        for (int i : fronts[currentFront]) {
            for (int j : dominatedSolutions[i]) {
                dominationCount[j]--;

                if (dominationCount[j] == 0) {
                    population[j].rank = currentFront + 1; // Assign next rank
                    nextFront.push_back(j);
                }
            }
        }

        if (!nextFront.empty()) fronts.push_back(nextFront);
        currentFront++;
    }

    vector<vector<Solution>>fronts_sol(fronts.size());
    for (int i = 0; i < fronts.size(); ++i) {
        for (int idx : fronts[i]) {
            fronts_sol[i].push_back(population[idx]);
        }
    }


    return fronts_sol;
}


// Multi-Objective Optimization
// std::vector<Solution>
void  optimize(const std::vector<Customer> &customers, int populationSize, int generations, int vehicleCapacity, int depotReadyTime, int depotCloseTime) {
    std::vector<Solution> population;
    for (int i = 0; i < populationSize; ++i) {
        auto routes = generateInitialPopulation(customers, vehicleCapacity, depotReadyTime, depotCloseTime);
        // for(auto it:routes){
        //  for(auto itt:it.customers){
        //      cout<<itt<<" ";
        //  }cout<<"\n";
        // }
        // cout<<"neww\n";
        population.push_back(evaluateSolution(routes, customers));
        // cout<<population[i].numVehicles<<" "<<population[i].totalDistance<<"\n";
        // cout<<"\n";

    }
   
    // return ; 
    // non-dominant sorting
    auto fronts = nonDominatedSorting(population);
 
    int N = 0 ;
    int Ng = generations ;

    while (N < Ng){
        bool flag = true ;
        if(4*N > 3*Ng ){
            flag = false;
        }

        for(int i=0;i<25;i++){
            int idx1 = std::rand() % population.size();
            int idx2 = std::rand() % population.size();

            if(idx1 != idx2){
                for(int obj =1;obj<=2;obj++){
                    Solution child , mutate_child ; 
                    if(flag == true){
                         child=crossover(population[idx1],population[idx2],customers,vehicleCapacity,depotCloseTime,obj);
                         mutate_child = mutate(child,customers,vehicleCapacity,depotCloseTime,obj);
                    }else{
                         child = Better(population[idx1],population[idx2],obj);
                         mutate_child = mutate(child,customers,vehicleCapacity,depotCloseTime,obj);
                    }
                    
                    Solution new_child;
                    if(isdominate(mutate_child,child)){
                        new_child = mutate_child;
                    }else if(isdominate(child,mutate_child)){
                        new_child = child;
                    }else{
                        if(is_good(mutate_child,child,obj)){
                           new_child = mutate_child;
                        }else{
                           new_child = child;
                        }
                    }
                    if(is_unique_child(new_child,population)){
                        population.push_back(new_child);
                    }
                }
            }
        }

        // if(population.size() > 2*populationSize){
        // cout<<population.size()<<" ";
        // Step 3: Non-Dominated Sorting
        auto fronts = nonDominatedSorting(population);

        // Step 4: Calculate Crowding Distance for Each Front
        for (auto &front : fronts) {
            calculateCrowdingDistance(front);
        }

        // Step 5: Selection for Next Generation
        std::vector<Solution> nextGeneration;
        for ( auto &front : fronts) {
            if (nextGeneration.size() + front.size() <= populationSize) {
                // Add entire front
                for ( auto &solution : front) {
                    nextGeneration.push_back(solution);
                }
            } else {
                // Sort the front by crowding distance (descending)
                vector<int> sortedFront(front.size());
                for (int i = 0; i < front.size(); ++i) {
                    sortedFront[i] = i;
                }

                // Sort by crowding distance
                sort(sortedFront.begin(), sortedFront.end(), [&](int a, int b) {
                    return front[a].crowdingDistance > front[b].crowdingDistance;
                });

                // Add the required solutions to fill the population
                int required =  populationSize - nextGeneration.size();
                for (int i = 0; i < required; ++i) {
                    nextGeneration.push_back(front[sortedFront[i]]);
                }
                break;
            }
        }
        
        population = nextGeneration;
    // }
        
        N++;

    }
    
    // cout<<population.size()<<" ";
    // non-dominant sorting
    fronts = nonDominatedSorting(population);
    cout<<fronts.size()<<endl;
    for (int i = 0; i < fronts.size(); ++i) {
        // cout << "Front " << i + 1 << ": ";
        cout<<fronts[i].size()<<endl;
        for (auto idx : fronts[i]) {
            cout << idx.totalDistance << " " << idx.numVehicles<<endl; // Index of solution in population

            cout<<idx.routes.size()<<endl;

            for(auto route : idx.routes){
                cout<<route.customers.size()<<endl;
                for(auto customer : route.customers){
                    cout<<customer<<" ";
                }
                cout<<endl;
            }

        }
        cout <<endl;
    }
    

}

int main(){
     #ifndef ONLINE_JUDGE
        freopen("input.txt","r",stdin);
        // freopen("output.txt","w",stdout);
      #endif


        int n;
        cin>>n;

     
        int vehicleCapacity = 200;
        int depotReadyTime = 0;
        int depotCloseTime = 230;

   
    std::vector<Customer> customers = {{0, 35, 35, 0, 0, 230, 0}, 
{1, 41, 49, 10, 161, 171, 10}, 
{2, 35, 17, 7, 50, 60, 10}, 
{3, 55, 45, 13, 116, 126, 10}, 
{4, 55, 20, 19, 149, 159, 10}, 
{5, 15, 30, 26, 34, 44, 10}, 
{6, 25, 30, 3, 99, 109, 10}, 
{7, 20, 50, 5, 81, 91, 10}, 
{8, 10, 43, 9, 95, 105, 10}, 
{9, 55, 60, 16, 97, 107, 10}, 
{10, 30, 60, 16, 124, 134, 10}, 
{11, 20, 65, 12, 67, 77, 10}, 
{12, 50, 35, 19, 63, 73, 10}, 
{13, 30, 25, 23, 159, 169, 10}, 
{14, 15, 10, 20, 32, 42, 10}, 
{15, 30, 5, 8, 61, 71, 10}, 
{16, 10, 20, 19, 75, 85, 10}, 
{17, 5, 30, 2, 157, 167, 10}, 
{18, 20, 40, 12, 87, 97, 10}, 
{19, 15, 60, 17, 76, 86, 10}, 
{20, 45, 65, 9, 126, 136, 10}, 
{21, 45, 20, 11, 62, 72, 10}, 
{22, 45, 10, 18, 97, 107, 10}, 
{23, 55, 5, 29, 68, 78, 10}, 
{24, 65, 35, 3, 153, 163, 10}, 
{25, 65, 20, 6, 172, 182, 10}
};
  






    
    int populationSize = 10;
    int generations = 2;
    
    optimize(customers, populationSize, generations, vehicleCapacity, depotReadyTime, depotCloseTime);

    return 0;

}

