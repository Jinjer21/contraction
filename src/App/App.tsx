import React, { useState, useEffect } from 'react';
import './App.scss';
import { Store, IContraction } from '../Store'; 

const App: React.FC = () => {
  const {state, dispatch} = React.useContext(Store);

  const reset = () => {
    if(window.confirm("Are you sure you want to reset?")){
      dispatch({type: 'RESET_CONTRACTIONS'});
      dispatch({type: 'RESET_MIDCONTRACTION'});
    }
  }

  return (
    <div className="App">
      <main>
        {
          state.midContraction ?
          <button className="contraction end" onClick={() => {dispatch({type: 'CONTRACTION_END', payload: new Date()}); dispatch({type: 'TOGGLE_CONTRACTION'})} }>end</button>
          :
          <button className="contraction" onClick={() => {dispatch({type: 'CONTRACTION_START', payload: new Date()}); dispatch({type: 'TOGGLE_CONTRACTION'})} }>start</button>
        }
        <div className="summary">
          {state.contractions.length > 0 ? <TimeSinceLastContraction latestContraction={state.contractions[0]}></TimeSinceLastContraction> : null}
          { state.contractions.length > 1 ? <Summary contractions={state.contractions.slice(0, 3)}></Summary> : null}
        </div>
        
      <table>
        <thead>
          <tr>
            <th>Start</th>
            <th>End</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {state.contractions.map(
            contraction => {
              return <ContractionListItem key={contraction.id} contraction={contraction}></ContractionListItem>
            }
          )}
        </tbody>
        </table>
        {
          state.contractions.length > 0 ? <button className="reset" onClick={() => reset()}>Reset</button> : null
        }
        
      </main>
    </div>
  );
}

const ContractionListItem: React.FunctionComponent<{contraction: IContraction}> = ({contraction}) => {
  
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let timer: any;
      if(contraction.end === undefined){
        setDuration(dateDiffInSeconds(new Date(), contraction.start));
        timer = setInterval(
          () => {
            setDuration(dateDiffInSeconds(new Date(), contraction.start));
          }, 1000
        )
      } else {
        setDuration(dateDiffInSeconds(contraction.end, contraction.start));
      }

      return(() => {
        clearInterval(timer);
      })

    }, [contraction]);

  return (
    <tr>
      <td>
        {contraction.start.toLocaleTimeString()}
      </td>
      {
        contraction.end !== undefined ? <td>{contraction.end.toLocaleTimeString()}</td> : <td></td>
      }
      <td>
          { formatTime(duration) }
      </td> 
    </tr>)
}

const Summary: React.FunctionComponent<{contractions: IContraction[]}> = ({contractions}) => {

  const latestContraction = contractions[0];

  let recentDiff = dateDiffInSeconds(latestContraction.start, contractions[1].end!);

  const recentDiffDisplay = <div className="recent-diff"><label>Time between last 2 contractions</label> {formatTime(recentDiff)}</div>
      
  if(contractions.length === 3){
    let startDate = latestContraction.end === undefined ? latestContraction.start : latestContraction.end;
    const allDiff = dateDiffInSeconds(startDate, contractions[2].start);
    return <>{recentDiffDisplay}<div className={allDiff < 10*60 ? 'all-diff alert' : 'all-diff'}><label>Time for last 3 contractions</label> {formatTime(allDiff)}</div></>
  } else {
    return recentDiffDisplay;
  }
}

const TimeSinceLastContraction: React.FunctionComponent<{latestContraction: IContraction}> = ({latestContraction}) => {
  const [duration, setDuration] = useState(0);
  
  useEffect(() => {
    let timer: any;

    if(latestContraction.end !== undefined){
      setDuration(dateDiffInSeconds(new Date(), latestContraction.end!));
      timer = setInterval(() => {
        setDuration(dateDiffInSeconds(new Date(), latestContraction.end!));
      }, 1000)
    } else {
      setDuration(0);
    }

    return(() => clearInterval(timer))

    
  }, [duration, latestContraction])

  if(latestContraction.end === undefined){
    return null;
  } else {
    return(
      <div className="timer">
        <label>Time since last Contraction</label>
        {formatTime(duration)}
        </div>
    )
  }


}


function formatTime(totalSeconds: number){
  let minutes = Math.floor(totalSeconds/60);
  let seconds = totalSeconds%60;
  
  return `${minutes} Minutes, ${seconds.toFixed(0)} Seconds`;
}

function dateDiffInSeconds(startDate: Date, endDate: Date): number{
  return (startDate.valueOf() - endDate.valueOf())/1000;
}

export default App;
