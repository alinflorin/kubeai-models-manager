import { makeStyles, shorthands, Title1 } from "@fluentui/react-components";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("1rem"),
  },
});

function Home() {
    const styles = useStyles();

    return (
        <div className={styles.container}>
            <Title1 as="h1">Home</Title1>
            <p>Welcome to the home page!</p>
        </div>
    );
}

export default Home;
