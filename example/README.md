## Working example of docker image

### Containers
| Image                  | Purpose                                                    | accessible from outside |
|------------------------|------------------------------------------------------------|-------------------------|
| amir4rab/upload-server | Storing file into storage                                  | No                      |
| nginx                  | Serving static files                                       | yes                     |
| Dockerfile             | Front end and a layer between front end and upload-server  | yes                     |