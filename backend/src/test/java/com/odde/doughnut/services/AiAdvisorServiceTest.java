package com.odde.doughnut.services;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.odde.doughnut.exceptions.OpenAiUnauthorizedException;
import com.odde.doughnut.testability.MakeMeWithoutDB;
import com.theokanning.openai.completion.CompletionResult;
import com.theokanning.openai.service.OpenAiService;
import java.util.Collections;
import okhttp3.MediaType;
import okhttp3.ResponseBody;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import retrofit2.HttpException;
import retrofit2.Response;

class AiAdvisorServiceTest {

  private AiAdvisorService aiAdvisorService;
  @Mock private OpenAiService openAiServiceMock;
  MakeMeWithoutDB makeMe = new MakeMeWithoutDB();

  @BeforeEach
  void Setup() {
    MockitoAnnotations.openMocks(this);
    aiAdvisorService = new AiAdvisorService(openAiServiceMock);
  }

  @Test
  void getAiSuggestion_givenAString_returnsAiSuggestionObject() {
    CompletionResult completionResult =
        makeMe.openAiCompletionResult().choice("suggestion_value").please();
    Mockito.when(openAiServiceMock.createCompletion(Mockito.any())).thenReturn(completionResult);
    assertEquals(
        "suggestion_value", aiAdvisorService.getAiSuggestion("suggestion_prompt").suggestion());
  }

  @Test
  void getAiSuggestion_givenAString_whenHttpError_returnsEmptySuggestion() {
    HttpException httpException = buildHttpException(400);
    Mockito.when(openAiServiceMock.createCompletion(ArgumentMatchers.any()))
        .thenThrow(httpException);
    assertThrows(HttpException.class, () -> aiAdvisorService.getAiSuggestion("suggestion_prompt"));
  }

  @Test
  void getAiEngagingStory_givenAlistOfStrings_returnsAStory() {
    CompletionResult completionResult =
        makeMe.openAiCompletionResult().choice("This is an engaging story").please();
    Mockito.when(openAiServiceMock.createCompletion(Mockito.any())).thenReturn(completionResult);
    assertEquals(
        "This is an engaging story",
        aiAdvisorService.getEngagingStory(Collections.singletonList("title")).engagingStory());
  }

  @Test
  void getAiSuggestion_given_invalidToken_return_401() {
    HttpException httpException = buildHttpException(401);
    Mockito.when(openAiServiceMock.createCompletion(ArgumentMatchers.any()))
        .thenThrow(httpException);
    OpenAiUnauthorizedException exception =
        assertThrows(OpenAiUnauthorizedException.class, () -> aiAdvisorService.getAiSuggestion(""));
    assertThat(exception.getMessage(), containsString("401"));
  }

  private static HttpException buildHttpException(int statusCode) {
    return new HttpException(
        Response.error(statusCode, ResponseBody.create("{}", MediaType.parse("application/json"))));
  }
}
