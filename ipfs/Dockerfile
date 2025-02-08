FROM ipfs/go-ipfs:latest

# Expose IPFS ports
EXPOSE 4001 5001 8080

# Override the default command to include --enable-pubsub-experiment
CMD ["daemon", "--enable-pubsub-experiment"]
