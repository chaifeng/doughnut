package com.odde.doughnut.controllers;

import com.odde.doughnut.controllers.currentUser.CurrentUserFetcher;
import com.odde.doughnut.entities.json.CurrentUserInfo;
import com.odde.doughnut.factoryServices.ModelFactoryService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
record RestCurrentUserInfoController(
    ModelFactoryService modelFactoryService, CurrentUserFetcher currentUserFetcher) {
  @GetMapping("/current-user-info")
  public CurrentUserInfo currentUserInfo() {
    CurrentUserInfo currentUserInfo = new CurrentUserInfo();
    currentUserInfo.user = currentUserFetcher.getUser().getEntity();
    currentUserInfo.externalIdentifier = currentUserFetcher.getExternalIdentifier();
    return currentUserInfo;
  }
}
