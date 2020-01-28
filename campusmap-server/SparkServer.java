package campuspaths;

import campuspaths.utils.CORSFilter;
import com.google.gson.Gson;
import pathfinder.ModelConnector;
import pathfinder.datastructures.Path;
import spark.*;

import static java.lang.Thread.sleep;

/**
 * The server for the campus maps application. Allows the campus maps application to get a list of locations
 * and finding a path between two points.
 */
public class SparkServer {
    private static ModelConnector connector = new ModelConnector();
    private static Gson gson = new Gson();

    /**
     * When run, creates a Spark server accessible at localhost:4567
     * @param args
     *  Not used by the main function
     */
    public static void main(String[] args) {
        CORSFilter corsFilter = new CORSFilter();
        corsFilter.apply();
        // The above two lines help set up some settings that allow the
        // React application to make requests to the Spark server, even though it
        // comes from a different server.

        // The campus maps application can retrieve a list of locations through this route
        Spark.get("/getLocations", new Route() {
            @Override
            public Object handle(Request request, Response response) throws InterruptedException {
              return gson.toJson(connector.getLocations());
            }
        });


        // The campus maps application can retrieve a path between two locations through this route.
        Spark.get("/findPath", new Route() {
            @Override
            public Object handle(Request request, Response response) {
                if (!connector.shortNameExists(request.queryParams("src"))) {
                    Spark.halt(455); // Source did not exist
                }

                if (!connector.shortNameExists(request.queryParams("dest"))) {
                    Spark.halt(456); // Destination did not exist
                }

                Path path = connector.findShortestPath(request.queryParams("src"), request.queryParams("dest"));
                if (path == null) {
                    Spark.halt(457); //No path between the two nodes
                }

                return gson.toJson(path);
            }
        });
    }
}
