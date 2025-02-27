package com.odde.doughnut.models.quizFacotries;

import com.odde.doughnut.entities.Link;
import com.odde.doughnut.entities.Note;
import com.odde.doughnut.entities.QuizQuestion;
import com.odde.doughnut.entities.json.QuizQuestionViewedByUser;
import java.util.List;

public class LinkSourceWithinSameLinkTypeQuizPresenter implements QuizQuestionPresenter {
  protected final Link link;

  public LinkSourceWithinSameLinkTypeQuizPresenter(QuizQuestion quizQuestion) {
    this.link = quizQuestion.getReviewPoint().getLink();
  }

  @Override
  public String mainTopic() {
    return link.getTargetNote().getTitle();
  }

  @Override
  public String instruction() {
    return "Which one <em>is immediately " + link.getLinkTypeLabel() + "</em>:";
  }

  @Override
  public QuizQuestionViewedByUser.OptionCreator optionCreator() {
    return new QuizQuestionViewedByUser.ClozeLinkOptionCreator();
  }

  @Override
  public List<Note> knownRightAnswers() {
    return List.of(link.getSourceNote());
  }
}
