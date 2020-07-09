import React from "react";
import { GetServerSideProps } from "next";
import Cookie from "lib/models/Cookie";
import {
  Button,
  FormControl,
  MenuItem,
  CircularProgress,
} from "@material-ui/core";
import Select from "@material-ui/core/Select";
import Editor from "components/Editor";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Layout from "components/Layout";
import { CheckCircleOutline, Error } from "@material-ui/icons";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Typography from "@material-ui/core/Typography";
import FileCopyRoundedIcon from '@material-ui/icons/FileCopyRounded';
import { withStyles, createStyles, Theme } from "@material-ui/core/styles";
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from "@material-ui/core/IconButton";
import ReactModal from "react-modal";
//import zIndex from "@material-ui/core/styles/zIndex";
//import ModalButton from "./modal-button";

const styles = createStyles((theme: Theme) => ({
  root: {
    width: "100%",
    marginBottom: 0,
    marginRight: "auto",
    marginLeft: "auto",
    textAlign: "center",

  },
  paper: {
    flexDirection: "column",
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    marginTop: theme.spacing(5),
    minHeight: "80%",
    maxWidth: "1100px",
  },
  paper2: {
    flexDirection: "column",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(2),
    maxWidth: "1100px",
  },
  details: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  formControl: {
    margin: theme.spacing(1),
    marginTop: theme.spacing(1.8),
    minWidth: 120,
  },
  button: {
    marginTop: theme.spacing(3),
  },
  
  
}));

interface IProps {
  data: any;
  classes: any;
}

interface IState {
  value: string;
  lang: string;
  theme: string;
  res: Array<any>;
  isLoading: boolean;
  showModal: boolean;
  copied: boolean;
}

class QuesDetail extends React.Component<IProps, IState> {
  interval: any;
  constructor(props: Readonly<IProps>) {
    super(props);
    this.state = {
      value: "",
      lang: "c++",
      theme: "theme-terminal",
      res: [],
      isLoading: false,
      showModal: false,
      copied: false,
    };
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.changeCopyState = this.changeCopyState.bind(this);
  }
  handleOpenModal() {
    this.setState({ showModal: true });
  }

  handleCloseModal() {
    this.setState({ showModal: false });
  }
  changeCopyState() {
    this.setState({ copied: true }, () => {
      setTimeout(() => this.setState({ copied: false }), 1500);
    });
  }

  submitcode = (code: any, lang: any) => {
    this.setState({
      isLoading: true,
    });
    var self = this;
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.token}`,
      },
      body: JSON.stringify({
        code: encodeURI(code),
        lang: lang,
        q_id: this.props.data.question_code,
      }),
    })
      .then((resp) => resp.json())
      .then((res) => {
        localStorage.taskid = res["task_id"];
        self.interval = setInterval(() => self.statuscode(), 2000);
      })
      .catch((error) => console.log(error));
  };

  statuscode = () => {
    var self = this;
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.token}`,
      },
      body: JSON.stringify({
        q_id: this.props.data.question_code,
        task_id: localStorage.taskid,
      }),
    })
      .then((resp) => resp.json())
      .then((response) => {
        self.setState({ res: response, isLoading: false });
        clearInterval(self.interval);
      })
      .then(() => console.log(this.state.res))
      .catch((err) => console.log(err));
  };

  render() {
    const { classes } = this.props;
    return (
      <Layout>
        <div>
          <ReactModal
            isOpen={this.state.showModal}
            contentLabel="Minimal Modal Example"
          >
            <div
              style={{
                margin: "0 auto",
                textAlign: "center",
                height: "0px",
              }}
            >
              <Paper elevation={3} className={classes.paper2}>
                <div style={{ margin: "0 auto", textAlign: "center" }}>
                  <FormControl className={classes.formControl}>
                    <Select
                      labelId="demo-controlled-open-select-label"
                      id="demo-controlled-open-select"
                      value={this.state.lang}
                      onChange={(e) =>
                        this.setState({ lang: e.target.value as string })
                      }
                    >
                      <MenuItem value="c">C</MenuItem>
                      <MenuItem value="c++">C++</MenuItem>
                      <MenuItem value="python3">Python</MenuItem>
                      <MenuItem value="java">Java</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl className={classes.formControl}>
                    <Select
                      labelId="demo-controlled-open-select-label"
                      id="demo-controlled-open-select"
                      value={this.state.theme}
                      onChange={(e) =>
                        this.setState({ theme: e.target.value as string })
                      }
                    >
                      <MenuItem value="theme-terminal">terminal</MenuItem>
                      <MenuItem value="theme-tomorrow">tomorrow</MenuItem>
                      <MenuItem value="theme-twilight">twilight</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    style={{ marginTop: "14px" }}
                    onClick={this.handleCloseModal}
                  >
                    MINIMIZE
                  </Button>
                  <Editor
                    value={this.state.value}
                    lang={this.state.lang}
                    theme={this.state.theme}
                    setValue={(d) =>
                      this.setState({
                        value: d,
                      })
                    }
                  />

                  {this.state.isLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                      <Button
                        className={classes.button}
                        color="primary"
                        variant="outlined"
                        style={{
                          border: "None",
                          backgroundColor: "#7788ff",
                          height: "30px",
                          width: "100px",
                          borderRadius: "5px",
                          color: "white",
                          textDecoration: "None",
                          marginBottom: "20px",
                        }}
                        onClick={() =>
                          this.submitcode(this.state.value, this.state.lang)
                        }
                      >
                        Submit
                      </Button>
                    )}
                </div>

                {this.state.res.length > 1 ? (
                  <TableContainer component={Paper}>
                    <Table
                      style={{
                        minWidth: 650,
                      }}
                      aria-label="simple table"
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell>TestCase (Number)</TableCell>
                          <TableCell align="right">Status</TableCell>
                          <TableCell align="right">Run-Time</TableCell>
                          <TableCell align="right">Memory Used</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.state.res.map((res, index) => (
                          <TableRow key={index}>
                            <TableCell component="th" scope="row">
                              {index + 1}
                            </TableCell>
                            <TableCell align="right">
                              <ResultStatus status={res.status.run_status} />
                            </TableCell>
                            <TableCell align="right">
                              {res.status.cpu_time}
                            </TableCell>
                            <TableCell align="right">
                              {res.status.memory_taken}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                    <React.Fragment>
                      {this.state.res.map((res, index) => (
                        <div key={index}>
                          <p>Compilation Error</p>
                          <p>{res.message}</p>
                        </div>
                      ))}
                    </React.Fragment>
                  )}
              </Paper>
            </div>
          </ReactModal>
        </div>
        <div style={{ margin: "20px" }}>
          <Paper
            elevation={3}
            className={classes.paper}
            style={{ margin: "20px auto" }}
          >
            <div className={classes.details}>
              <Typography
                className={classes.title}
                style={{
                  color: "#4455dd",
                  fontSize: "18px",
                  textTransform: "capitalize",
                }}
                gutterBottom
              >
                {this.props.data.question_code}&nbsp;|&nbsp;
                {this.props.data.question_name}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                {this.props.data.question_text}
              </Typography>
              <hr></hr>
              <Typography
                style={{ fontSize: "18px", color: "#4455dd" }}
                gutterBottom
              >
                INPUT EXAMPLE
              </Typography>
              <CopyToClipboard text={this.props.data.input_example} onCopy={this.changeCopyState}>
              <Typography variant="subtitle1" gutterBottom>
                <div
                  style={{ whiteSpace: "pre-wrap" }}
                  dangerouslySetInnerHTML={{
                    __html: this.props.data.input_example,
                  }}
                />
                  
                <Tooltip title={this.state.copied ? "COPIED !" : "COPY TO CLIPBOARD"}>
                <IconButton  aria-label="upload picture" component="span">
                < FileCopyRoundedIcon />
                </IconButton>
                </Tooltip>
                
              </Typography>
              </CopyToClipboard>
              <hr></hr>
              <Typography
                style={{ fontSize: "18px", color: "#4455dd" }}
                gutterBottom
              >
                OUTPUT EXAMPLE
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                <div
                  style={{ whiteSpace: "pre-wrap" }}
                  dangerouslySetInnerHTML={{
                    __html: this.props.data.output_example,
                  }}
                />
                  
              </Typography>
              
              <hr></hr>

              <div>
                <Button
                  style={{
                    border: "None",
                    backgroundColor: "#7788ff",
                    height: "30px",
                    width: "100px",
                    borderRadius: "5px",
                    color: "white",
                    textDecoration: "None",
                  }}
                  onClick={this.handleOpenModal}
                >
                  CODE
                </Button>
              </div>
            </div>
          </Paper>
        </div>
      </Layout>
    );
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookie = new Cookie();
  cookie.parse(context.req.headers.cookie || "");

  try {
    let resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quesdetail?contest_id=${context.query.con}&q_id=${context.params?.question}`,
      {
        headers: {
          Authorization: `Token ${cookie.cookies.get("token")}`,
        },
      }
    );

    let response = await resp.json();

    return {
      props: {
        data: response,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        data: "",
      },
    };
  }
};

function ResultStatus({ status }) {
  if (status == "AC") {
    return <CheckCircleOutline />;
  } else if (status == "WA") {
    return <Error />;
  } else return status;
}

export default withStyles(styles)(QuesDetail);

