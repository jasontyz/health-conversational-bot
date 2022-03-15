import React from 'react';

import { Switch, Route, useRouteMatch } from 'react-router-dom';
import TicketsListView from './TicketsListView';
import TicketDetailView from './TicketDetail';
const TicketsRoute = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}/:id`}>
        <TicketDetailView />
      </Route>
      <Route path={`${path}`}>
        <TicketsListView />
      </Route>
    </Switch>
  );
};

export default TicketsRoute;
