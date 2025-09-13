import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize('G-L3K0S1CNRW');
};

export const logEvent = (category, action) => {
  ReactGA.event({ category, action });
};
